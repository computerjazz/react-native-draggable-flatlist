Object.defineProperty(exports, "__esModule", { value: true });
exports.default = void 0;
var _reactNativeReanimated = require("react-native-reanimated");
var _utils = require("../utils");
var ScrollOffsetListener = function ScrollOffsetListener(_ref) {
  var scrollOffset = _ref.scrollOffset,
    onScrollOffsetChange = _ref.onScrollOffsetChange;
  (0, _reactNativeReanimated.useAnimatedReaction)(
    (function () {
      var _f = function _f() {
        return scrollOffset.value;
      };
      _f._closure = { scrollOffset: scrollOffset };
      _f.asString =
        "function _f(){const{scrollOffset}=jsThis._closure;{return scrollOffset.value;}}";
      _f.__workletHash = 14236293224915;
      _f.__location =
        "/Users/cs/Code/react-native-draggable-flatlist/src/components/ScrollOffsetListener.tsx (14:22)";
      return _f;
    })(),
    (function () {
      var _f = function _f(cur, prev) {
        if (cur !== prev) {
          (0, _reactNativeReanimated.runOnJS)(onScrollOffsetChange)(cur);
        }
      };
      _f._closure = {
        runOnJS: _reactNativeReanimated.runOnJS,
        onScrollOffsetChange: onScrollOffsetChange,
      };
      _f.asString =
        "function _f(cur,prev){const{runOnJS,onScrollOffsetChange}=jsThis._closure;{if(cur!==prev){runOnJS(onScrollOffsetChange)(cur);}}}";
      _f.__workletHash = 2670088941649;
      _f.__location =
        "/Users/cs/Code/react-native-draggable-flatlist/src/components/ScrollOffsetListener.tsx (16:5)";
      return _f;
    })(),
    [scrollOffset]
  );
  return null;
};
var _default = (0, _utils.typedMemo)(ScrollOffsetListener);
exports.default = _default;
//# sourceMappingURL=ScrollOffsetListener.js.map
