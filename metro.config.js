const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Allow loading wasm and csv assets
config.resolver.sourceExts.push('wasm');
config.resolver.assetExts.push('csv');

module.exports = config;