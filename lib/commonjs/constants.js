Object.defineProperty(exports, "__esModule", { value: true });
exports.isReanimatedV2 = exports.isWeb = exports.isAndroid = exports.isIOS = exports.DEFAULT_PROPS = exports.DEFAULT_ANIMATION_CONFIG = exports.SCROLL_POSITION_TOLERANCE = void 0;
var _reactNative = require("react-native");
var _reactNativeReanimated = require("react-native-reanimated");
var SCROLL_POSITION_TOLERANCE = 2;
exports.SCROLL_POSITION_TOLERANCE = SCROLL_POSITION_TOLERANCE;
var DEFAULT_ANIMATION_CONFIG = {
  damping: 20,
  mass: 0.2,
  stiffness: 100,
  overshootClamping: false,
  restSpeedThreshold: 0.2,
  restDisplacementThreshold: 0.2,
};
exports.DEFAULT_ANIMATION_CONFIG = DEFAULT_ANIMATION_CONFIG;
var DEFAULT_PROPS = {
  autoscrollThreshold: 30,
  autoscrollSpeed: 100,
  animationConfig: DEFAULT_ANIMATION_CONFIG,
  scrollEnabled: true,
  dragHitSlop: 0,
  activationDistance: 0,
  dragItemOverflow: false,
};
exports.DEFAULT_PROPS = DEFAULT_PROPS;
var isIOS = _reactNative.Platform.OS === "ios";
exports.isIOS = isIOS;
var isAndroid = _reactNative.Platform.OS === "android";
exports.isAndroid = isAndroid;
var isWeb = _reactNative.Platform.OS === "web";
exports.isWeb = isWeb;
var isReanimatedV2 = !!_reactNativeReanimated.useSharedValue;
exports.isReanimatedV2 = isReanimatedV2;
if (!isReanimatedV2) {
  throw new Error(
    "Your version of react-native-reanimated is too old for react-native-draggable-flatlist!"
  );
}
//# sourceMappingURL=constants.js.map
