var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", { value: true });
Object.defineProperty(exports, "useOnCellActiveAnimation", {
  enumerable: true,
  get: function get() {
    return _useOnCellActiveAnimation.useOnCellActiveAnimation;
  },
});
exports.OpacityDecorator = exports.ShadowDecorator = exports.ScaleDecorator = void 0;
var _react = _interopRequireDefault(require("react"));
var _reactNative = require("react-native");
var _reactNativeReanimated = _interopRequireWildcard(
  require("react-native-reanimated")
);
var _draggableFlatListContext = require("../context/draggableFlatListContext");
var _useOnCellActiveAnimation = require("../hooks/useOnCellActiveAnimation");
var _this = this,
  _jsxFileName =
    "/Users/cs/Code/react-native-draggable-flatlist/src/components/CellDecorators.tsx";
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
var ScaleDecorator = function ScaleDecorator(_ref) {
  var _ref$activeScale = _ref.activeScale,
    activeScale = _ref$activeScale === void 0 ? 1.1 : _ref$activeScale,
    children = _ref.children;
  var _useOnCellActiveAnima = (0,
    _useOnCellActiveAnimation.useOnCellActiveAnimation)({
      animationConfig: { mass: 0.1, restDisplacementThreshold: 0.0001 },
    }),
    isActive = _useOnCellActiveAnima.isActive,
    onActiveAnim = _useOnCellActiveAnima.onActiveAnim;
  var _useDraggableFlatList = (0,
    _draggableFlatListContext.useDraggableFlatListContext)(),
    horizontal = _useDraggableFlatList.horizontal;
  var style = (0, _reactNativeReanimated.useAnimatedStyle)(
    (function () {
      var _f = function _f() {
        var animScale = (0, _reactNativeReanimated.interpolate)(
          onActiveAnim.value,
          [0, 1],
          [1, activeScale]
        );
        var scale = isActive ? animScale : 1;
        return { transform: [{ scaleX: scale }, { scaleY: scale }] };
      };
      _f._closure = {
        interpolate: _reactNativeReanimated.interpolate,
        onActiveAnim: onActiveAnim,
        activeScale: activeScale,
        isActive: isActive,
      };
      _f.asString =
        "function _f(){const{interpolate,onActiveAnim,activeScale,isActive}=jsThis._closure;{const animScale=interpolate(onActiveAnim.value,[0,1],[1,activeScale]);const scale=isActive?animScale:1;return{transform:[{scaleX:scale},{scaleY:scale}]};}}";
      _f.__workletHash = 17199828062713;
      _f.__location =
        "/Users/cs/Code/react-native-draggable-flatlist/src/components/CellDecorators.tsx (22:33)";
      _f.__optimalization = 3;
      return _f;
    })(),
    [isActive]
  );
  return _react.default.createElement(
    _reactNativeReanimated.default.View,
    {
      style: [style, horizontal && styles.horizontal],
      __self: _this,
      __source: { fileName: _jsxFileName, lineNumber: 31, columnNumber: 5 },
    },
    children
  );
};
exports.ScaleDecorator = ScaleDecorator;
var ShadowDecorator = function ShadowDecorator(_ref2) {
  var _ref2$elevation = _ref2.elevation,
    elevation = _ref2$elevation === void 0 ? 10 : _ref2$elevation,
    _ref2$color = _ref2.color,
    color = _ref2$color === void 0 ? "black" : _ref2$color,
    _ref2$opacity = _ref2.opacity,
    opacity = _ref2$opacity === void 0 ? 0.25 : _ref2$opacity,
    _ref2$radius = _ref2.radius,
    radius = _ref2$radius === void 0 ? 5 : _ref2$radius,
    children = _ref2.children;
  var _useOnCellActiveAnima2 = (0,
    _useOnCellActiveAnimation.useOnCellActiveAnimation)(),
    isActive = _useOnCellActiveAnima2.isActive,
    onActiveAnim = _useOnCellActiveAnima2.onActiveAnim;
  var _useDraggableFlatList2 = (0,
    _draggableFlatListContext.useDraggableFlatListContext)(),
    horizontal = _useDraggableFlatList2.horizontal;
  var style = (0, _reactNativeReanimated.useAnimatedStyle)(
    (function () {
      var _f = function _f() {
        var shadowOpacity = onActiveAnim.value * opacity;
        return {
          elevation: isActive ? elevation : 0,
          shadowRadius: isActive ? radius : 0,
          shadowColor: isActive ? color : "transparent",
          shadowOpacity: isActive ? shadowOpacity : 0,
        };
      };
      _f._closure = {
        onActiveAnim: onActiveAnim,
        opacity: opacity,
        isActive: isActive,
        elevation: elevation,
        radius: radius,
        color: color,
      };
      _f.asString =
        'function _f(){const{onActiveAnim,opacity,isActive,elevation,radius,color}=jsThis._closure;{const shadowOpacity=onActiveAnim.value*opacity;return{elevation:isActive?elevation:0,shadowRadius:isActive?radius:0,shadowColor:isActive?color:"transparent",shadowOpacity:isActive?shadowOpacity:0};}}';
      _f.__workletHash = 4043081223969;
      _f.__location =
        "/Users/cs/Code/react-native-draggable-flatlist/src/components/CellDecorators.tsx (55:33)";
      _f.__optimalization = 3;
      return _f;
    })(),
    [isActive, onActiveAnim]
  );
  return _react.default.createElement(
    _reactNativeReanimated.default.View,
    {
      style: [style, horizontal && styles.horizontal],
      __self: _this,
      __source: { fileName: _jsxFileName, lineNumber: 66, columnNumber: 5 },
    },
    children
  );
};
exports.ShadowDecorator = ShadowDecorator;
var OpacityDecorator = function OpacityDecorator(_ref3) {
  var _ref3$activeOpacity = _ref3.activeOpacity,
    activeOpacity = _ref3$activeOpacity === void 0 ? 0.25 : _ref3$activeOpacity,
    children = _ref3.children;
  var _useOnCellActiveAnima3 = (0,
    _useOnCellActiveAnimation.useOnCellActiveAnimation)(),
    isActive = _useOnCellActiveAnima3.isActive,
    onActiveAnim = _useOnCellActiveAnima3.onActiveAnim;
  var _useDraggableFlatList3 = (0,
    _draggableFlatListContext.useDraggableFlatListContext)(),
    horizontal = _useDraggableFlatList3.horizontal;
  var style = (0, _reactNativeReanimated.useAnimatedStyle)(
    (function () {
      var _f = function _f() {
        var opacity = (0, _reactNativeReanimated.interpolate)(
          onActiveAnim.value,
          [0, 1],
          [1, activeOpacity]
        );
        return { opacity: isActive ? opacity : 1 };
      };
      _f._closure = {
        interpolate: _reactNativeReanimated.interpolate,
        onActiveAnim: onActiveAnim,
        activeOpacity: activeOpacity,
        isActive: isActive,
      };
      _f.asString =
        "function _f(){const{interpolate,onActiveAnim,activeOpacity,isActive}=jsThis._closure;{const opacity=interpolate(onActiveAnim.value,[0,1],[1,activeOpacity]);return{opacity:isActive?opacity:1};}}";
      _f.__workletHash = 11305163295580;
      _f.__location =
        "/Users/cs/Code/react-native-draggable-flatlist/src/components/CellDecorators.tsx (83:33)";
      _f.__optimalization = 3;
      return _f;
    })(),
    [isActive]
  );
  return _react.default.createElement(
    _reactNativeReanimated.default.View,
    {
      style: [style, horizontal && styles.horizontal],
      __self: _this,
      __source: { fileName: _jsxFileName, lineNumber: 91, columnNumber: 5 },
    },
    children
  );
};
exports.OpacityDecorator = OpacityDecorator;
var styles = _reactNative.StyleSheet.create({
  horizontal: { flexDirection: "row", flex: 1 },
});
//# sourceMappingURL=CellDecorators.js.map
