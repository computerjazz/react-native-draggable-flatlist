/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 *
 * @format
 */
const path = require("path");
const { getDefaultConfig } = require('expo/metro-config');

const extraNodeModules = {
  "react-native-draggable-flatlist": path.resolve(__dirname + "/../lib/commonjs"),
};
const watchFolders = [
  path.resolve(__dirname + "/../lib/commonjs"),
  path.resolve(__dirname + "/../src"),
];

// Get the default Expo config for SDK 52
const config = getDefaultConfig(__dirname, {
  // Enable CSS support
  isCSSEnabled: true,
});

// Merge the default config with our custom config
module.exports = {
  ...config,
  transformer: {
    ...config.transformer,
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: false,
      },
    }),
    babelTransformerPath: require.resolve("react-native-svg-transformer"),
  },
  resolver: {
    ...config.resolver,
    extraNodeModules: new Proxy(extraNodeModules, {
      get: (target, name) =>
        //redirects dependencies referenced from target/ to local node_modules
        name in target
          ? target[name]
          : path.join(process.cwd(), `node_modules/${name}`),
    }),
    assetExts: [
      ...config.resolver.assetExts,
      'ttf',
      'otf',
      // Add other asset extensions if needed
      'png',
      'jpg',
      'jpeg',
      'gif',
      'webp',
    ],
    sourceExts: ['js', 'jsx', 'json', 'ts', 'tsx', 'svg'],
  },
  watchFolders,
};
