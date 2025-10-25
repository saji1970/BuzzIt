const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Exclude server directory from Metro bundler watch
config.watchFolders = [__dirname];
config.resolver.sourceExts.push('server');
config.resolver.blockList = [
  /server\/.*/, // Block server directory
];

module.exports = config;