var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = void 0;
var _slicedToArray2 = _interopRequireDefault(
  require("@babel/runtime/helpers/slicedToArray")
);
var _react = _interopRequireWildcard(require("react"));
var _reactNative = require("react-native");
var _reactNativeReanimated = _interopRequireWildcard(
  require("react-native-reanimated")
);
var _animatedValueContext = require("../context/animatedValueContext");
var _draggableFlatListContext = require("../context/draggableFlatListContext");
var _refContext = require("../context/refContext");
var _utils = require("../utils");
var _jsxFileName =
  "/Users/cs/Code/react-native-draggable-flatlist/src/components/PlaceholderItem.tsx";
function _getRequireWildcardCache(nodeInterop) {
  if (typeof WeakMap !== "function") return null;
  var cacheBabelInterop = new WeakMap();
  var cacheNodeInterop = new WeakMap();
  return (_getRequireWildcardCache = function _getRequireWildcardCache(
    nodeInterop
  ) {
    return nodeInterop ? cacheNodeInterop : cacheBabelInterop;
  })(nodeInterop);
}
function _interopRequireWildcard(obj, nodeInterop) {
  if (!nodeInterop && obj && obj.__esModule) {
    return obj;
  }
  if (obj === null || (typeof obj !== "object" && typeof obj !== "function")) {
    return { default: obj };
  }
  var cache = _getRequireWildcardCache(nodeInterop);
  if (cache && cache.has(obj)) {
    return cache.get(obj);
  }
  var newObj = {};
  var hasPropertyDescriptor =
    Object.defineProperty && Object.getOwnPropertyDescriptor;
  for (var key in obj) {
    if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) {
      var desc = hasPropertyDescriptor
        ? Object.getOwnPropertyDescriptor(obj, key)
        : null;
      if (desc && (desc.get || desc.set)) {
        Object.defineProperty(newObj, key, desc);
      } else {
        newObj[key] = obj[key];
      }
    }
  }
  newObj.default = obj;
  if (cache) {
    cache.set(obj, newObj);
  }
  return newObj;
}
function PlaceholderItem(_ref) {
  var _propsRef$current;
  var renderPlaceholder = _ref.renderPlaceholder;
  var _useState = (0, _react.useState)(0),
    _useState2 = (0, _slicedToArray2.default)(_useState, 2),
    size = _useState2[0],
    setSize = _useState2[1];
  var _useAnimatedValues = (0, _animatedValueContext.useAnimatedValues)(),
    activeCellSize = _useAnimatedValues.activeCellSize,
    placeholderOffset = _useAnimatedValues.placeholderOffset,
    spacerIndexAnim = _useAnimatedValues.spacerIndexAnim,
    horizontalAnim = _useAnimatedValues.horizontalAnim,
    scrollOffset = _useAnimatedValues.scrollOffset;
  var _useRefs = (0, _refContext.useRefs)(),
    keyToIndexRef = _useRefs.keyToIndexRef,
    propsRef = _useRefs.propsRef;
  var _useDraggableFlatList = (0,
    _draggableFlatListContext.useDraggableFlatListContext)(),
    activeKey = _useDraggableFlatList.activeKey,
    horizontal = _useDraggableFlatList.horizontal;
  (0, _reactNativeReanimated.useAnimatedReaction)(
    (function () {
      var _f = function _f() {
        return activeCellSize.value;
      };
      _f._closure = { activeCellSize: activeCellSize };
      _f.asString =
        "function _f(){const{activeCellSize}=jsThis._closure;{return activeCellSize.value;}}";
      _f.__workletHash = 8295849844051;
      _f.__location =
        "/Users/cs/Code/react-native-draggable-flatlist/src/components/PlaceholderItem.tsx (32:4)";
      return _f;
    })(),
    (function () {
      var _f = function _f(cur, prev) {
        if (cur !== prev) {
          (0, _reactNativeReanimated.runOnJS)(setSize)(cur);
        }
      };
      _f._closure = {
        runOnJS: _reactNativeReanimated.runOnJS,
        setSize: setSize,
      };
      _f.asString =
        "function _f(cur,prev){const{runOnJS,setSize}=jsThis._closure;{if(cur!==prev){runOnJS(setSize)(cur);}}}";
      _f.__workletHash = 8290012385169;
      _f.__location =
        "/Users/cs/Code/react-native-draggable-flatlist/src/components/PlaceholderItem.tsx (35:4)";
      return _f;
    })()
  );
  var activeIndex = activeKey
    ? keyToIndexRef.current.get(activeKey)
    : undefined;
  var activeItem =
    activeIndex === undefined
      ? null
      : (_propsRef$current = propsRef.current) == null
      ? void 0
      : _propsRef$current.data[activeIndex];
  var animStyle = (0, _reactNativeReanimated.useAnimatedStyle)(
    (function () {
      var _f = function _f() {
        var offset = placeholderOffset.value - scrollOffset.value;
        return {
          opacity: size >= 0 ? 1 : 0,
          overflow: "hidden",
          transform: [
            horizontalAnim.value
              ? { translateX: offset }
              : { translateY: offset },
          ],
        };
      };
      _f._closure = {
        placeholderOffset: placeholderOffset,
        scrollOffset: scrollOffset,
        size: size,
        horizontalAnim: horizontalAnim,
      };
      _f.asString =
        "function _f(){const{placeholderOffset,scrollOffset,size,horizontalAnim}=jsThis._closure;{const offset=placeholderOffset.value-scrollOffset.value;return{opacity:size>=0?1:0,overflow:'hidden',transform:[horizontalAnim.value?{translateX:offset}:{translateY:offset}]};}}";
      _f.__workletHash = 13197147672694;
      _f.__location =
        "/Users/cs/Code/react-native-draggable-flatlist/src/components/PlaceholderItem.tsx (48:37)";
      _f.__optimalization = 3;
      return _f;
    })(),
    [spacerIndexAnim, placeholderOffset, horizontalAnim, scrollOffset, size]
  );
  var extraStyle = (0, _react.useMemo)(
    function () {
      return horizontal ? { width: size } : { height: size };
    },
    [horizontal, size]
  );
  return _react.default.createElement(
    _reactNativeReanimated.default.View,
    {
      pointerEvents: activeKey ? "auto" : "none",
      style: [_reactNative.StyleSheet.absoluteFill, animStyle, extraStyle],
      __self: this,
      __source: { fileName: _jsxFileName, lineNumber: 67, columnNumber: 5 },
    },
    !activeItem || activeIndex === undefined
      ? null
      : renderPlaceholder == null
      ? void 0
      : renderPlaceholder({ item: activeItem, index: activeIndex })
  );
}
var _default = (0, _utils.typedMemo)(PlaceholderItem);
exports.default = _default;
//# sourceMappingURL=PlaceholderItem.js.map
