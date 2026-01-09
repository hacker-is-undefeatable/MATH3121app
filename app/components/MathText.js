import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

export default function MathText({ text, style = {} }) {
  const webViewRef = useRef(null);
  const [contentHeight, setContentHeight] = useState(0);
  
  if (!text) return null;

  const normalizedText = useMemo(() => {
    let value = String(text);

    // Common case: LaTeX backslashes arrive double-escaped (e.g. "\\frac")
    // Convert those back to single backslashes so MathJax can parse them.
    value = value
      .replace(/\\\\([a-zA-Z])/g, '\\$1')
      .replace(/\\\\([()[\]{}$\\])/g, '\\$1');

    // Preserve author-intended line breaks.
    value = value.replace(/\r\n|\n|\r/g, '<br/>');

    // If there are TeX commands present but no math delimiters, wrap as inline math.
    const hasTexCommand = /\\[a-zA-Z]+/.test(value);
    const hasDelimiters = /\\\(|\\\[|\$[^$]*\$/.test(value);
    // Detect TeX math usage without commands, e.g. 6^{2n+4}, x_1, y^{2}
    const hasTexSyntaxNoCommand = /(\^\s*\{[^}]+\}|\^[0-9A-Za-z]+|_\s*\{[^}]+\}|_[0-9A-Za-z]+)/.test(value);
    if (!hasDelimiters && (hasTexCommand || hasTexSyntaxNoCommand)) {
      value = `\\(${value}\\)`;
    }

    return value;
  }, [text]);

  // Reset measured height whenever the displayed text changes to avoid carrying
  // over a larger height from the previous question.
  useEffect(() => {
    setContentHeight(0);
  }, [normalizedText]);

  const flattenedStyle = useMemo(() => {
    // `style` may be an array; flatten for safe reads.
    // eslint-disable-next-line react-native/no-inline-styles
    return Array.isArray(style) ? Object.assign({}, ...style) : style;
  }, [style]);

  const textColor = flattenedStyle?.color || '#FFFFFF';
  const fontSize = flattenedStyle?.fontSize || 16;
  const textAlign = flattenedStyle?.textAlign || 'center';
  const minHeight = flattenedStyle?.minHeight ?? 20;

  const injectedJavaScript = `
    (function() {
      function postHeight() {
        var height = 0;
        try {
          var el = document.querySelector('.math-container');
          if (el) {
            // Prefer element scrollHeight to avoid including unrelated document sizing.
            height = el.scrollHeight;
          } else {
            height = document.body ? document.body.scrollHeight : 0;
          }
        } catch (e) {
          height = 0;
        }
        if (window.ReactNativeWebView && height) {
          window.ReactNativeWebView.postMessage(String(height));
        }
      }

      // Measure a few times because MathJax loads/lay outs asynchronously.
      setTimeout(postHeight, 50);
      setTimeout(postHeight, 300);
      setTimeout(postHeight, 800);

      if (window.MutationObserver) {
        try {
          var observer = new MutationObserver(function() {
            postHeight();
          });
          var target = document.querySelector('.math-container') || document.documentElement;
          observer.observe(target, { childList: true, subtree: true, attributes: true });
        } catch (e) {}
      }
    })();
    true;
  `;

  // HTML template with MathJax
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <script>
        MathJax = {
          tex: {
            // IMPORTANT: this script runs inside the WebView.
            // To make MathJax see the delimiter "\\(" (i.e. \( in text),
            // we must output "\\\\(" in the outer template literal.
            inlineMath: [['$', '$'], ['\\\\(', '\\\\)']],
            displayMath: [['\\\\[', '\\\\]']]
          },
          svg: {
            fontCache: 'global'
          },
          options: {
            skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre']
          }
        };
      </script>
      <script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js"></script>
      <style>
        body {
          margin: 0;
          padding: 0;
          color: ${textColor};
          font-size: ${fontSize}px;
          text-align: ${textAlign};
          background-color: transparent;
          font-family: -apple-system, BlinkMacSystemFont, sans-serif;
          overflow: visible;
        }
        p {
          margin: 0;
          padding: 0;
        }
        .math-container {
          padding: 8px;
          background-color: transparent;
          width: 100%;
        }
        mjx-container {
          max-width: 100%;
          margin: 0 !important;
        }
        mjx-container svg {
          max-width: 100% !important;
          height: auto !important;
        }
      </style>
    </head>
    <body>
      <div class="math-container">
        ${normalizedText}
      </div>
      <script>
        window.addEventListener('load', function() {
          if (typeof MathJax !== 'undefined') {
            MathJax.typesetPromise().then(function() {
              if (window.ReactNativeWebView) {
                var el = document.querySelector('.math-container');
                var height = el ? el.scrollHeight : Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
                window.ReactNativeWebView.postMessage(String(height));
              }
            });
          }
        });
      </script>
    </body>
    </html>
  `;

  const measuredHeight = Math.max(minHeight, contentHeight || 0);

  return (
    <View style={[styles.container, { minHeight, height: measuredHeight }, style]}>
      <WebView
        ref={webViewRef}
        source={{ html }}
        key={normalizedText}
        style={[styles.webview, { height: measuredHeight, minHeight }]}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#FFFFFF" />
          </View>
        )}
        scalesPageToFit={false}
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        mixedContentMode="always"
        injectedJavaScript={injectedJavaScript}
        onMessage={(event) => {
          const nextHeight = Number(event?.nativeEvent?.data);
          if (Number.isFinite(nextHeight) && nextHeight > 0) {
            // Add a tiny buffer to avoid last-pixel clipping.
            setContentHeight(Math.ceil(nextHeight) + 2);
          }
        }}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.warn('WebView error: ', nativeEvent);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: 'transparent',
  },
  webview: {
    backgroundColor: 'transparent',
    width: '100%',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1f1f1fff',
    width: '100%',
    height: '100%',
    borderRadius: 0,
  },
});