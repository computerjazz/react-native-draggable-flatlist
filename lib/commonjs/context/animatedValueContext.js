Object.defineProperty(exports, "__esModule", { value: true });
exports.default = AnimatedValueProvider;
exports.useAnimatedValues = useAnimatedValues;
var _react = _interopRequireWildcard(require("react"));
var _reactNativeReanimated = require("react-native-reanimated");
var _reactNativeGestureHandler = require("react-native-gesture-handler");
var _propsContext = require("./propsContext");
var _jsxFileName =
  "/Users/cs/Code/react-native-draggable-flatlist/src/context/animatedValueContext.tsx";
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
var AnimatedValueContext = _react.default.createContext(undefined);
function AnimatedValueProvider(_ref) {
  var children = _ref.children;
  var value = useSetupAnimatedValues();
  return _react.default.createElement(
    AnimatedValueContext.Provider,
    {
      value: value,
      __self: this,
      __source: { fileName: _jsxFileName, lineNumber: 21, columnNumber: 5 },
    },
    children
  );
}
function useAnimatedValues() {
  var value = (0, _react.useContext)(AnimatedValueContext);
  if (!value) {
    throw new Error(
      "useAnimatedValues must be called from within AnimatedValueProvider!"
    );
  }
  return value;
}
function useSetupAnimatedValues() {
  var props = (0, _propsContext.useProps)();
  var DEFAULT_VAL = (0, _reactNativeReanimated.useSharedValue)(0);
  var containerSize = (0, _reactNativeReanimated.useSharedValue)(0);
  var scrollViewSize = (0, _reactNativeReanimated.useSharedValue)(0);
  var panGestureState = (0, _reactNativeReanimated.useSharedValue)(
    _reactNativeGestureHandler.State.UNDETERMINED
  );
  var touchTranslate = (0, _reactNativeReanimated.useSharedValue)(0);
  var isTouchActiveNative = (0, _reactNativeReanimated.useSharedValue)(false);
  var hasMoved = (0, _reactNativeReanimated.useSharedValue)(0);
  var disabled = (0, _reactNativeReanimated.useSharedValue)(false);
  var horizontalAnim = (0, _reactNativeReanimated.useSharedValue)(
    !!props.horizontal
  );
  var activeIndexAnim = (0, _reactNativeReanimated.useSharedValue)(-1);
  var spacerIndexAnim = (0, _reactNativeReanimated.useSharedValue)(-1);
  var activeCellSize = (0, _reactNativeReanimated.useSharedValue)(0);
  var activeCellOffset = (0, _reactNativeReanimated.useSharedValue)(0);
  var scrollOffset = (0, _reactNativeReanimated.useSharedValue)(0);
  var scrollInit = (0, _reactNativeReanimated.useSharedValue)(0);
  var viewableIndexMin = (0, _reactNativeReanimated.useSharedValue)(0);
  var viewableIndexMax = (0, _reactNativeReanimated.useSharedValue)(0);
  var outerScrollOffset = props.outerScrollOffset || DEFAULT_VAL;
  var outerScrollInit = (0, _reactNativeReanimated.useSharedValue)(0);
  (0, _reactNativeReanimated.useAnimatedReaction)(
    (function () {
      var _f = function _f() {
        return activeIndexAnim.value;
      };
      _f._closure = { activeIndexAnim: activeIndexAnim };
      _f.asString =
        "function _f(){const{activeIndexAnim}=jsThis._closure;{return activeIndexAnim.value;}}";
      _f.__workletHash = 1662895275731;
      _f.__location =
        "/Users/cs/Code/react-native-draggable-flatlist/src/context/animatedValueContext.tsx (74:4)";
      return _f;
    })(),
    (function () {
      var _f = function _f(cur, prev) {
        if (cur !== prev && cur >= 0) {
          scrollInit.value = scrollOffset.value;
          outerScrollInit.value = outerScrollOffset.value;
        }
      };
      _f._closure = {
        scrollInit: scrollInit,
        scrollOffset: scrollOffset,
        outerScrollInit: outerScrollInit,
        outerScrollOffset: outerScrollOffset,
      };
      _f.asString =
        "function _f(cur,prev){const{scrollInit,scrollOffset,outerScrollInit,outerScrollOffset}=jsThis._closure;{if(cur!==prev&&cur>=0){scrollInit.value=scrollOffset.value;outerScrollInit.value=outerScrollOffset.value;}}}";
      _f.__workletHash = 14917928217945;
      _f.__location =
        "/Users/cs/Code/react-native-draggable-flatlist/src/context/animatedValueContext.tsx (77:4)";
      return _f;
    })(),
    [outerScrollOffset]
  );
  var placeholderOffset = (0, _reactNativeReanimated.useSharedValue)(0);
  var isDraggingCell = (0, _reactNativeReanimated.useDerivedValue)(
    (function () {
      var _f = function _f() {
        return isTouchActiveNative.value && activeIndexAnim.value >= 0;
      };
      _f._closure = {
        isTouchActiveNative: isTouchActiveNative,
        activeIndexAnim: activeIndexAnim,
      };
      _f.asString =
        "function _f(){const{isTouchActiveNative,activeIndexAnim}=jsThis._closure;{return isTouchActiveNative.value&&activeIndexAnim.value>=0;}}";
      _f.__workletHash = 15157110606697;
      _f.__location =
        "/Users/cs/Code/react-native-draggable-flatlist/src/context/animatedValueContext.tsx (88:41)";
      return _f;
    })(),
    []
  );
  var autoScrollDistance = (0, _reactNativeReanimated.useDerivedValue)(
    (function () {
      var _f = function _f() {
        if (!isDraggingCell.value) return 0;
        var innerScrollDiff = scrollOffset.value - scrollInit.value;
        var outerScrollDiff = outerScrollOffset.value - outerScrollInit.value;
        var scrollDiff = innerScrollDiff + outerScrollDiff;
        return scrollDiff;
      };
      _f._closure = {
        isDraggingCell: isDraggingCell,
        scrollOffset: scrollOffset,
        scrollInit: scrollInit,
        outerScrollOffset: outerScrollOffset,
        outerScrollInit: outerScrollInit,
      };
      _f.asString =
        "function _f(){const{isDraggingCell,scrollOffset,scrollInit,outerScrollOffset,outerScrollInit}=jsThis._closure;{if(!isDraggingCell.value)return 0;const innerScrollDiff=scrollOffset.value-scrollInit.value;const outerScrollDiff=outerScrollOffset.value-outerScrollInit.value;const scrollDiff=innerScrollDiff+outerScrollDiff;return scrollDiff;}}";
      _f.__workletHash = 15552139107413;
      _f.__location =
        "/Users/cs/Code/react-native-draggable-flatlist/src/context/animatedValueContext.tsx (92:45)";
      return _f;
    })(),
    []
  );
  var touchPositionDiff = (0, _reactNativeReanimated.useDerivedValue)(
    (function () {
      var _f = function _f() {
        var extraTranslate = isTouchActiveNative.value
          ? autoScrollDistance.value
          : 0;
        return touchTranslate.value + extraTranslate;
      };
      _f._closure = {
        isTouchActiveNative: isTouchActiveNative,
        autoScrollDistance: autoScrollDistance,
        touchTranslate: touchTranslate,
      };
      _f.asString =
        "function _f(){const{isTouchActiveNative,autoScrollDistance,touchTranslate}=jsThis._closure;{const extraTranslate=isTouchActiveNative.value?autoScrollDistance.value:0;return touchTranslate.value+extraTranslate;}}";
      _f.__workletHash = 6038336113742;
      _f.__location =
        "/Users/cs/Code/react-native-draggable-flatlist/src/context/animatedValueContext.tsx (101:44)";
      return _f;
    })(),
    []
  );
  var touchPositionDiffConstrained = (0,
  _reactNativeReanimated.useDerivedValue)(
    (function () {
      var _f = function _f() {
        var containerMinusActiveCell =
          containerSize.value - activeCellSize.value + scrollOffset.value;
        var offsetRelativeToScrollTop =
          touchPositionDiff.value + activeCellOffset.value;
        var constrained = Math.min(
          containerMinusActiveCell,
          Math.max(scrollOffset.value, offsetRelativeToScrollTop)
        );
        var maxTranslateNegative = -activeCellOffset.value;
        var maxTranslatePositive =
          scrollViewSize.value -
          (activeCellOffset.value + activeCellSize.value);
        var constrainedBase = isTouchActiveNative.value
          ? constrained - activeCellOffset.value
          : touchPositionDiff.value;
        return Math.min(
          Math.max(constrainedBase, maxTranslateNegative),
          maxTranslatePositive
        );
      };
      _f._closure = {
        containerSize: containerSize,
        activeCellSize: activeCellSize,
        scrollOffset: scrollOffset,
        touchPositionDiff: touchPositionDiff,
        activeCellOffset: activeCellOffset,
        scrollViewSize: scrollViewSize,
        isTouchActiveNative: isTouchActiveNative,
      };
      _f.asString =
        "function _f(){const{containerSize,activeCellSize,scrollOffset,touchPositionDiff,activeCellOffset,scrollViewSize,isTouchActiveNative}=jsThis._closure;{const containerMinusActiveCell=containerSize.value-activeCellSize.value+scrollOffset.value;const offsetRelativeToScrollTop=touchPositionDiff.value+activeCellOffset.value;const constrained=Math.min(containerMinusActiveCell,Math.max(scrollOffset.value,offsetRelativeToScrollTop));const maxTranslateNegative=-activeCellOffset.value;const maxTranslatePositive=scrollViewSize.value-(activeCellOffset.value+activeCellSize.value);const constrainedBase=isTouchActiveNative.value?constrained-activeCellOffset.value:touchPositionDiff.value;return Math.min(Math.max(constrainedBase,maxTranslateNegative),maxTranslatePositive);}}";
      _f.__workletHash = 12403615032773;
      _f.__location =
        "/Users/cs/Code/react-native-draggable-flatlist/src/context/animatedValueContext.tsx (108:55)";
      return _f;
    })(),
    []
  );
  var hoverAnim = (0, _reactNativeReanimated.useDerivedValue)(
    (function () {
      var _f = function _f() {
        if (activeIndexAnim.value < 0) return 0;
        return props.dragItemOverflow
          ? touchPositionDiff.value
          : touchPositionDiffConstrained.value;
      };
      _f._closure = {
        activeIndexAnim: activeIndexAnim,
        props: { dragItemOverflow: props.dragItemOverflow },
        touchPositionDiff: touchPositionDiff,
        touchPositionDiffConstrained: touchPositionDiffConstrained,
      };
      _f.asString =
        "function _f(){const{activeIndexAnim,props,touchPositionDiff,touchPositionDiffConstrained}=jsThis._closure;{if(activeIndexAnim.value<0)return 0;return props.dragItemOverflow?touchPositionDiff.value:touchPositionDiffConstrained.value;}}";
      _f.__workletHash = 4766979967758;
      _f.__location =
        "/Users/cs/Code/react-native-draggable-flatlist/src/context/animatedValueContext.tsx (136:36)";
      return _f;
    })(),
    []
  );
  var hoverOffset = (0, _reactNativeReanimated.useDerivedValue)(
    (function () {
      var _f = function _f() {
        return hoverAnim.value + activeCellOffset.value;
      };
      _f._closure = {
        hoverAnim: hoverAnim,
        activeCellOffset: activeCellOffset,
      };
      _f.asString =
        "function _f(){const{hoverAnim,activeCellOffset}=jsThis._closure;{return hoverAnim.value+activeCellOffset.value;}}";
      _f.__workletHash = 13741556660209;
      _f.__location =
        "/Users/cs/Code/react-native-draggable-flatlist/src/context/animatedValueContext.tsx (143:38)";
      return _f;
    })(),
    [hoverAnim, activeCellOffset]
  );
  (0, _reactNativeReanimated.useDerivedValue)(
    (function () {
      var _f = function _f() {
        var isHovering = activeIndexAnim.value >= 0;
        if (!isHovering && spacerIndexAnim.value >= 0) {
          spacerIndexAnim.value = -1;
        }
      };
      _f._closure = {
        activeIndexAnim: activeIndexAnim,
        spacerIndexAnim: spacerIndexAnim,
      };
      _f.asString =
        "function _f(){const{activeIndexAnim,spacerIndexAnim}=jsThis._closure;{const isHovering=activeIndexAnim.value>=0;if(!isHovering&&spacerIndexAnim.value>=0){spacerIndexAnim.value=-1;}}}";
      _f.__workletHash = 11056248743165;
      _f.__location =
        "/Users/cs/Code/react-native-draggable-flatlist/src/context/animatedValueContext.tsx (147:18)";
      return _f;
    })(),
    []
  );
  var resetTouchedCell = (0, _react.useCallback)(function () {
    activeCellOffset.value = 0;
    hasMoved.value = 0;
  }, []);
  var value = (0, _react.useMemo)(
    function () {
      return {
        activeCellOffset: activeCellOffset,
        activeCellSize: activeCellSize,
        activeIndexAnim: activeIndexAnim,
        containerSize: containerSize,
        disabled: disabled,
        horizontalAnim: horizontalAnim,
        hoverAnim: hoverAnim,
        hoverOffset: hoverOffset,
        isDraggingCell: isDraggingCell,
        isTouchActiveNative: isTouchActiveNative,
        panGestureState: panGestureState,
        placeholderOffset: placeholderOffset,
        resetTouchedCell: resetTouchedCell,
        scrollOffset: scrollOffset,
        scrollViewSize: scrollViewSize,
        spacerIndexAnim: spacerIndexAnim,
        touchPositionDiff: touchPositionDiff,
        touchTranslate: touchTranslate,
        autoScrollDistance: autoScrollDistance,
        viewableIndexMin: viewableIndexMin,
        viewableIndexMax: viewableIndexMax,
      };
    },
    [
      activeCellOffset,
      activeCellSize,
      activeIndexAnim,
      containerSize,
      disabled,
      horizontalAnim,
      hoverAnim,
      hoverOffset,
      isDraggingCell,
      isTouchActiveNative,
      panGestureState,
      placeholderOffset,
      resetTouchedCell,
      scrollOffset,
      scrollViewSize,
      spacerIndexAnim,
      touchPositionDiff,
      touchTranslate,
      autoScrollDistance,
      viewableIndexMin,
      viewableIndexMax,
    ]
  );
  (0, _react.useEffect)(
    function () {
      props.onAnimValInit == null ? void 0 : props.onAnimValInit(value);
    },
    [value]
  );
  return value;
}
//# sourceMappingURL=animatedValueContext.js.map
