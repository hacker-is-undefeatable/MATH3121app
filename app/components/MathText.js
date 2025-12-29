import React, { useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

export default function MathText({ text, style = {} }) {
  const webViewRef = useRef(null);
  
  if (!text) return null;

  const textColor = style.color || '#FFFFFF';
  const fontSize = style.fontSize || 16;
  const textAlign = style.textAlign || 'center';

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
            inlineMath: [['$', '$'], ['\\(', '\\)']]
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
        }
        p {
          margin: 0;
          padding: 0;
        }
        .math-container {
          padding: 10px;
          background-color: transparent;
        }
      </style>
    </head>
    <body>
      <div class="math-container">
        ${text}
      </div>
      <script>
        window.addEventListener('load', function() {
          if (typeof MathJax !== 'undefined') {
            MathJax.typesetPromise();
          }
        });
      </script>
    </body>
    </html>
  `;

  return (
    <View style={[styles.container, style]}>
      <WebView
        ref={webViewRef}
        source={{ html }}
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        scalesPageToFit={false}
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        mixedContentMode="always"
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
    flex: 1,
    width: '100%',
    minHeight: 50,
    backgroundColor: 'transparent',
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
    minHeight: 50,
  },
});