const path = require('path');
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

const existingBlockList = defaultConfig.resolver.blockList
  ? Array.isArray(defaultConfig.resolver.blockList)
    ? defaultConfig.resolver.blockList
    : [defaultConfig.resolver.blockList]
  : [];

const blockList = [...existingBlockList, /server\/.*/];

const config = mergeConfig(defaultConfig, {
  watchFolders: [__dirname],
  resolver: {
    ...defaultConfig.resolver,
    blockList,
    alias: {
      ...(defaultConfig.resolver?.alias || {}),
      '@expo/vector-icons': path.resolve(__dirname, 'node_modules/react-native-vector-icons'),
      '@expo/vector-icons/MaterialIcons': path.resolve(__dirname, 'node_modules/react-native-vector-icons/MaterialIcons.js'),
    },
  },
});

module.exports = config;