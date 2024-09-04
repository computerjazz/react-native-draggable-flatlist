/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 *
 * @format
 */
const path = require("path");
const { mergeConfig } = require("metro-config");
const { getDefaultConfig } = require("expo/metro-config");

const baseConfig = getDefaultConfig(__dirname);

const extraNodeModules = {
  "react-native-draggable-flatlist": path.resolve(__dirname + "/../src"),
};
const watchFolders = [path.resolve(__dirname + "/../src")];
const config = {
  transformer: {
    assetPlugins: ["expo-asset/tools/hashAssetFiles"],
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: false,
      },
    }),
  },
  resolver: {
    extraNodeModules: new Proxy(extraNodeModules, {
      get: (target, name) =>
        //redirects dependencies referenced from target/ to local node_modules
        name in target
          ? target[name]
          : path.join(process.cwd(), `node_modules/${name}`),
    }),
  },
  watchFolders,
};

module.exports = mergeConfig(baseConfig, config);
