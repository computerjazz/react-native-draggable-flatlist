Object.defineProperty(exports, "__esModule", { value: true });
exports.useAutoScroll = useAutoScroll;
var _reactNativeReanimated = require("react-native-reanimated");
var _constants = require("../constants");
var _propsContext = require("../context/propsContext");
var _animatedValueContext = require("../context/animatedValueContext");
var _refContext = require("../context/refContext");
function useAutoScroll() {
  var _useRefs = (0, _refContext.useRefs)(),
    flatlistRef = _useRefs.flatlistRef;
  var _useProps = (0, _propsContext.useProps)(),
    _useProps$autoscrollT = _useProps.autoscrollThreshold,
    autoscrollThreshold =
      _useProps$autoscrollT === void 0
        ? _constants.DEFAULT_PROPS.autoscrollThreshold
        : _useProps$autoscrollT,
    _useProps$autoscrollS = _useProps.autoscrollSpeed,
    autoscrollSpeed =
      _useProps$autoscrollS === void 0
        ? _constants.DEFAULT_PROPS.autoscrollSpeed
        : _useProps$autoscrollS;
  var _useAnimatedValues = (0, _animatedValueContext.useAnimatedValues)(),
    scrollOffset = _useAnimatedValues.scrollOffset,
    scrollViewSize = _useAnimatedValues.scrollViewSize,
    containerSize = _useAnimatedValues.containerSize,
    activeCellSize = _useAnimatedValues.activeCellSize,
    hoverOffset = _useAnimatedValues.hoverOffset,
    activeIndexAnim = _useAnimatedValues.activeIndexAnim;
  var hoverScreenOffset = (0, _reactNativeReanimated.useDerivedValue)(
    (function () {
      var _f = function _f() {
        return hoverOffset.value - scrollOffset.value;
      };
      _f._closure = { hoverOffset: hoverOffset, scrollOffset: scrollOffset };
      _f.asString =
        "function _f(){const{hoverOffset,scrollOffset}=jsThis._closure;{return hoverOffset.value-scrollOffset.value;}}";
      _f.__workletHash = 10763890843319;
      _f.__location =
        "/Users/cs/Code/react-native-draggable-flatlist/src/hooks/useAutoScroll.tsx (29:44)";
      return _f;
    })(),
    []
  );
  var isScrolledUp = (0, _reactNativeReanimated.useDerivedValue)(
    (function () {
      var _f = function _f() {
        return scrollOffset.value - _constants.SCROLL_POSITION_TOLERANCE <= 0;
      };
      _f._closure = {
        scrollOffset: scrollOffset,
        SCROLL_POSITION_TOLERANCE: _constants.SCROLL_POSITION_TOLERANCE,
      };
      _f.asString =
        "function _f(){const{scrollOffset,SCROLL_POSITION_TOLERANCE}=jsThis._closure;{return scrollOffset.value-SCROLL_POSITION_TOLERANCE<=0;}}";
      _f.__workletHash = 15578879662595;
      _f.__location =
        "/Users/cs/Code/react-native-draggable-flatlist/src/hooks/useAutoScroll.tsx (33:39)";
      return _f;
    })(),
    []
  );
  var isScrolledDown = (0, _reactNativeReanimated.useDerivedValue)(
    (function () {
      var _f = function _f() {
        return (
          scrollOffset.value +
            containerSize.value +
            _constants.SCROLL_POSITION_TOLERANCE >=
          scrollViewSize.value
        );
      };
      _f._closure = {
        scrollOffset: scrollOffset,
        containerSize: containerSize,
        SCROLL_POSITION_TOLERANCE: _constants.SCROLL_POSITION_TOLERANCE,
        scrollViewSize: scrollViewSize,
      };
      _f.asString =
        "function _f(){const{scrollOffset,containerSize,SCROLL_POSITION_TOLERANCE,scrollViewSize}=jsThis._closure;{return scrollOffset.value+containerSize.value+SCROLL_POSITION_TOLERANCE>=scrollViewSize.value;}}";
      _f.__workletHash = 7372520673244;
      _f.__location =
        "/Users/cs/Code/react-native-draggable-flatlist/src/hooks/useAutoScroll.tsx (37:41)";
      return _f;
    })(),
    []
  );
  var distToTopEdge = (0, _reactNativeReanimated.useDerivedValue)(
    (function () {
      var _f = function _f() {
        return Math.max(0, hoverScreenOffset.value);
      };
      _f._closure = { hoverScreenOffset: hoverScreenOffset };
      _f.asString =
        "function _f(){const{hoverScreenOffset}=jsThis._closure;{return Math.max(0,hoverScreenOffset.value);}}";
      _f.__workletHash = 5945680760068;
      _f.__location =
        "/Users/cs/Code/react-native-draggable-flatlist/src/hooks/useAutoScroll.tsx (44:40)";
      return _f;
    })(),
    []
  );
  var distToBottomEdge = (0, _reactNativeReanimated.useDerivedValue)(
    (function () {
      var _f = function _f() {
        var hoverPlusActiveCell =
          hoverScreenOffset.value + activeCellSize.value;
        return Math.max(0, containerSize.value - hoverPlusActiveCell);
      };
      _f._closure = {
        hoverScreenOffset: hoverScreenOffset,
        activeCellSize: activeCellSize,
        containerSize: containerSize,
      };
      _f.asString =
        "function _f(){const{hoverScreenOffset,activeCellSize,containerSize}=jsThis._closure;{const hoverPlusActiveCell=hoverScreenOffset.value+activeCellSize.value;return Math.max(0,containerSize.value-hoverPlusActiveCell);}}";
      _f.__workletHash = 17447360140833;
      _f.__location =
        "/Users/cs/Code/react-native-draggable-flatlist/src/hooks/useAutoScroll.tsx (48:43)";
      return _f;
    })(),
    []
  );
  var isAtTopEdge = (0, _reactNativeReanimated.useDerivedValue)(
    (function () {
      var _f = function _f() {
        return distToTopEdge.value <= autoscrollThreshold;
      };
      _f._closure = {
        distToTopEdge: distToTopEdge,
        autoscrollThreshold: autoscrollThreshold,
      };
      _f.asString =
        "function _f(){const{distToTopEdge,autoscrollThreshold}=jsThis._closure;{return distToTopEdge.value<=autoscrollThreshold;}}";
      _f.__workletHash = 499688299934;
      _f.__location =
        "/Users/cs/Code/react-native-draggable-flatlist/src/hooks/useAutoScroll.tsx (53:38)";
      return _f;
    })()
  );
  var isAtBottomEdge = (0, _reactNativeReanimated.useDerivedValue)(
    (function () {
      var _f = function _f() {
        return distToBottomEdge.value <= autoscrollThreshold;
      };
      _f._closure = {
        distToBottomEdge: distToBottomEdge,
        autoscrollThreshold: autoscrollThreshold,
      };
      _f.asString =
        "function _f(){const{distToBottomEdge,autoscrollThreshold}=jsThis._closure;{return distToBottomEdge.value<=autoscrollThreshold;}}";
      _f.__workletHash = 10361122491518;
      _f.__location =
        "/Users/cs/Code/react-native-draggable-flatlist/src/hooks/useAutoScroll.tsx (57:41)";
      return _f;
    })(),
    []
  );
  var scrollTarget = (0, _reactNativeReanimated.useSharedValue)(0);
  var dragIsActive = (0, _reactNativeReanimated.useDerivedValue)(
    (function () {
      var _f = function _f() {
        return activeIndexAnim.value >= 0;
      };
      _f._closure = { activeIndexAnim: activeIndexAnim };
      _f.asString =
        "function _f(){const{activeIndexAnim}=jsThis._closure;{return activeIndexAnim.value>=0;}}";
      _f.__workletHash = 16254827243008;
      _f.__location =
        "/Users/cs/Code/react-native-draggable-flatlist/src/hooks/useAutoScroll.tsx (62:39)";
      return _f;
    })(),
    []
  );
  (0, _reactNativeReanimated.useAnimatedReaction)(
    (function () {
      var _f = function _f() {
        return dragIsActive.value;
      };
      _f._closure = { dragIsActive: dragIsActive };
      _f.asString =
        "function _f(){const{dragIsActive}=jsThis._closure;{return dragIsActive.value;}}";
      _f.__workletHash = 4207325526803;
      _f.__location =
        "/Users/cs/Code/react-native-draggable-flatlist/src/hooks/useAutoScroll.tsx (67:4)";
      return _f;
    })(),
    (function () {
      var _f = function _f(cur, prev) {
        if (cur && !prev) {
          scrollTarget.value = scrollOffset.value;
        }
      };
      _f._closure = { scrollTarget: scrollTarget, scrollOffset: scrollOffset };
      _f.asString =
        "function _f(cur,prev){const{scrollTarget,scrollOffset}=jsThis._closure;{if(cur&&!prev){scrollTarget.value=scrollOffset.value;}}}";
      _f.__workletHash = 14491611054056;
      _f.__location =
        "/Users/cs/Code/react-native-draggable-flatlist/src/hooks/useAutoScroll.tsx (70:4)";
      return _f;
    })()
  );
  var shouldAutoScroll = (0, _reactNativeReanimated.useDerivedValue)(
    (function () {
      var _f = function _f() {
        var scrollTargetDiff = Math.abs(
          scrollTarget.value - scrollOffset.value
        );
        var hasScrolledToTarget =
          scrollTargetDiff < _constants.SCROLL_POSITION_TOLERANCE;
        var isAtEdge = isAtTopEdge.value || isAtBottomEdge.value;
        var topDisabled = isAtTopEdge.value && isScrolledUp.value;
        var bottomDisabled = isAtBottomEdge.value && isScrolledDown.value;
        var isEdgeDisabled = topDisabled || bottomDisabled;
        var cellIsActive = activeIndexAnim.value >= 0;
        return (
          hasScrolledToTarget && isAtEdge && !isEdgeDisabled && cellIsActive
        );
      };
      _f._closure = {
        scrollTarget: scrollTarget,
        scrollOffset: scrollOffset,
        SCROLL_POSITION_TOLERANCE: _constants.SCROLL_POSITION_TOLERANCE,
        isAtTopEdge: isAtTopEdge,
        isAtBottomEdge: isAtBottomEdge,
        isScrolledUp: isScrolledUp,
        isScrolledDown: isScrolledDown,
        activeIndexAnim: activeIndexAnim,
      };
      _f.asString =
        "function _f(){const{scrollTarget,scrollOffset,SCROLL_POSITION_TOLERANCE,isAtTopEdge,isAtBottomEdge,isScrolledUp,isScrolledDown,activeIndexAnim}=jsThis._closure;{const scrollTargetDiff=Math.abs(scrollTarget.value-scrollOffset.value);const hasScrolledToTarget=scrollTargetDiff<SCROLL_POSITION_TOLERANCE;const isAtEdge=isAtTopEdge.value||isAtBottomEdge.value;const topDisabled=isAtTopEdge.value&&isScrolledUp.value;const bottomDisabled=isAtBottomEdge.value&&isScrolledDown.value;const isEdgeDisabled=topDisabled||bottomDisabled;const cellIsActive=activeIndexAnim.value>=0;return hasScrolledToTarget&&isAtEdge&&!isEdgeDisabled&&cellIsActive;}}";
      _f.__workletHash = 8742571894036;
      _f.__location =
        "/Users/cs/Code/react-native-draggable-flatlist/src/hooks/useAutoScroll.tsx (77:43)";
      return _f;
    })(),
    []
  );
  function scrollToInternal(offset) {
    if (flatlistRef && "current" in flatlistRef) {
      var _flatlistRef$current;
      (_flatlistRef$current = flatlistRef.current) == null
        ? void 0
        : _flatlistRef$current.scrollToOffset({
            offset: offset,
            animated: true,
          });
    }
  }
  (0, _reactNativeReanimated.useDerivedValue)(
    (function () {
      var _f = function _f() {
        if (!shouldAutoScroll.value) return;
        var distFromEdge = isAtTopEdge.value
          ? distToTopEdge.value
          : distToBottomEdge.value;
        var speedPct = 1 - distFromEdge / autoscrollThreshold;
        var offset = speedPct * autoscrollSpeed;
        var targetOffset = isAtTopEdge.value
          ? Math.max(0, scrollOffset.value - offset)
          : Math.min(
              scrollOffset.value + offset,
              scrollViewSize.value - containerSize.value
            );
        scrollTarget.value = targetOffset;
        (0, _reactNativeReanimated.runOnJS)(scrollToInternal)(targetOffset);
      };
      _f._closure = {
        shouldAutoScroll: shouldAutoScroll,
        isAtTopEdge: isAtTopEdge,
        distToTopEdge: distToTopEdge,
        distToBottomEdge: distToBottomEdge,
        autoscrollThreshold: autoscrollThreshold,
        autoscrollSpeed: autoscrollSpeed,
        scrollOffset: scrollOffset,
        scrollViewSize: scrollViewSize,
        containerSize: containerSize,
        scrollTarget: scrollTarget,
        runOnJS: _reactNativeReanimated.runOnJS,
        scrollToInternal: scrollToInternal,
      };
      _f.asString =
        "function _f(){const{shouldAutoScroll,isAtTopEdge,distToTopEdge,distToBottomEdge,autoscrollThreshold,autoscrollSpeed,scrollOffset,scrollViewSize,containerSize,scrollTarget,runOnJS,scrollToInternal}=jsThis._closure;{if(!shouldAutoScroll.value)return;const distFromEdge=isAtTopEdge.value?distToTopEdge.value:distToBottomEdge.value;const speedPct=1-distFromEdge/autoscrollThreshold;const offset=speedPct*autoscrollSpeed;const targetOffset=isAtTopEdge.value?Math.max(0,scrollOffset.value-offset):Math.min(scrollOffset.value+offset,scrollViewSize.value-containerSize.value);scrollTarget.value=targetOffset;runOnJS(scrollToInternal)(targetOffset);}}";
      _f.__workletHash = 8964641543522;
      _f.__location =
        "/Users/cs/Code/react-native-draggable-flatlist/src/hooks/useAutoScroll.tsx (97:18)";
      return _f;
    })(),
    []
  );
  return null;
}
//# sourceMappingURL=useAutoScroll.js.map
