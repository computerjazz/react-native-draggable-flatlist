Object.defineProperty(exports, "__esModule", { value: true });
exports.useNestedAutoScroll = useNestedAutoScroll;
var _reactNativeReanimated = require("react-native-reanimated");
var _nestableScrollContainerContext = require("../context/nestableScrollContainerContext");
var _constants = require("../constants");
function useNestedAutoScroll(params) {
  var _useSafeNestableScrol = (0,
    _nestableScrollContainerContext.useSafeNestableScrollContainerContext)(),
    outerScrollOffset = _useSafeNestableScrol.outerScrollOffset,
    containerSize = _useSafeNestableScrol.containerSize,
    scrollableRef = _useSafeNestableScrol.scrollableRef,
    scrollViewSize = _useSafeNestableScrol.scrollViewSize;
  var DUMMY_VAL = (0, _reactNativeReanimated.useSharedValue)(0);
  var _params$hoverOffset = params.hoverOffset,
    hoverOffset =
      _params$hoverOffset === void 0 ? DUMMY_VAL : _params$hoverOffset,
    _params$activeCellSiz = params.activeCellSize,
    activeCellSize =
      _params$activeCellSiz === void 0 ? DUMMY_VAL : _params$activeCellSiz,
    _params$autoscrollSpe = params.autoscrollSpeed,
    autoscrollSpeed =
      _params$autoscrollSpe === void 0 ? 100 : _params$autoscrollSpe,
    _params$autoscrollThr = params.autoscrollThreshold,
    autoscrollThreshold =
      _params$autoscrollThr === void 0 ? 30 : _params$autoscrollThr,
    _params$isDraggingCel = params.isDraggingCell,
    isDraggingCell =
      _params$isDraggingCel === void 0 ? DUMMY_VAL : _params$isDraggingCel,
    _params$isTouchActive = params.isTouchActiveNative,
    isTouchActiveNative =
      _params$isTouchActive === void 0 ? DUMMY_VAL : _params$isTouchActive;
  var hoverScreenOffset = (0, _reactNativeReanimated.useDerivedValue)(
    (function () {
      var _f = function _f() {
        return hoverOffset.value - outerScrollOffset.value;
      };
      _f._closure = {
        hoverOffset: hoverOffset,
        outerScrollOffset: outerScrollOffset,
      };
      _f.asString =
        "function _f(){const{hoverOffset,outerScrollOffset}=jsThis._closure;{return hoverOffset.value-outerScrollOffset.value;}}";
      _f.__workletHash = 11717240117335;
      _f.__location =
        "/Users/cs/Code/react-native-draggable-flatlist/src/hooks/useNestedAutoScroll.tsx (45:44)";
      return _f;
    })(),
    []
  );
  var isScrolledUp = (0, _reactNativeReanimated.useDerivedValue)(
    (function () {
      var _f = function _f() {
        return (
          outerScrollOffset.value - _constants.SCROLL_POSITION_TOLERANCE <= 0
        );
      };
      _f._closure = {
        outerScrollOffset: outerScrollOffset,
        SCROLL_POSITION_TOLERANCE: _constants.SCROLL_POSITION_TOLERANCE,
      };
      _f.asString =
        "function _f(){const{outerScrollOffset,SCROLL_POSITION_TOLERANCE}=jsThis._closure;{return outerScrollOffset.value-SCROLL_POSITION_TOLERANCE<=0;}}";
      _f.__workletHash = 10747505363427;
      _f.__location =
        "/Users/cs/Code/react-native-draggable-flatlist/src/hooks/useNestedAutoScroll.tsx (49:39)";
      return _f;
    })(),
    []
  );
  var isScrolledDown = (0, _reactNativeReanimated.useDerivedValue)(
    (function () {
      var _f = function _f() {
        return (
          outerScrollOffset.value +
            containerSize.value +
            _constants.SCROLL_POSITION_TOLERANCE >=
          scrollViewSize.value
        );
      };
      _f._closure = {
        outerScrollOffset: outerScrollOffset,
        containerSize: containerSize,
        SCROLL_POSITION_TOLERANCE: _constants.SCROLL_POSITION_TOLERANCE,
        scrollViewSize: scrollViewSize,
      };
      _f.asString =
        "function _f(){const{outerScrollOffset,containerSize,SCROLL_POSITION_TOLERANCE,scrollViewSize}=jsThis._closure;{return outerScrollOffset.value+containerSize.value+SCROLL_POSITION_TOLERANCE>=scrollViewSize.value;}}";
      _f.__workletHash = 11318153912380;
      _f.__location =
        "/Users/cs/Code/react-native-draggable-flatlist/src/hooks/useNestedAutoScroll.tsx (53:41)";
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
        "/Users/cs/Code/react-native-draggable-flatlist/src/hooks/useNestedAutoScroll.tsx (60:40)";
      return _f;
    })(),
    [hoverScreenOffset]
  );
  var distToBottomEdge = (0, _reactNativeReanimated.useDerivedValue)(
    (function () {
      var _f = function _f() {
        var dist =
          containerSize.value -
          (hoverScreenOffset.value + activeCellSize.value);
        return Math.max(0, dist);
      };
      _f._closure = {
        containerSize: containerSize,
        hoverScreenOffset: hoverScreenOffset,
        activeCellSize: activeCellSize,
      };
      _f.asString =
        "function _f(){const{containerSize,hoverScreenOffset,activeCellSize}=jsThis._closure;{const dist=containerSize.value-(hoverScreenOffset.value+activeCellSize.value);return Math.max(0,dist);}}";
      _f.__workletHash = 11179566731136;
      _f.__location =
        "/Users/cs/Code/react-native-draggable-flatlist/src/hooks/useNestedAutoScroll.tsx (64:43)";
      return _f;
    })(),
    [hoverScreenOffset, activeCellSize, containerSize]
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
        "/Users/cs/Code/react-native-draggable-flatlist/src/hooks/useNestedAutoScroll.tsx (69:38)";
      return _f;
    })(),
    []
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
        "/Users/cs/Code/react-native-draggable-flatlist/src/hooks/useNestedAutoScroll.tsx (73:41)";
      return _f;
    })()
  );
  var scrollTarget = (0, _reactNativeReanimated.useSharedValue)(0);
  (0, _reactNativeReanimated.useAnimatedReaction)(
    (function () {
      var _f = function _f() {
        return isDraggingCell.value;
      };
      _f._closure = { isDraggingCell: isDraggingCell };
      _f.asString =
        "function _f(){const{isDraggingCell}=jsThis._closure;{return isDraggingCell.value;}}";
      _f.__workletHash = 15902771485203;
      _f.__location =
        "/Users/cs/Code/react-native-draggable-flatlist/src/hooks/useNestedAutoScroll.tsx (80:4)";
      return _f;
    })(),
    (function () {
      var _f = function _f(cur, prev) {
        if (cur && !prev) {
          scrollTarget.value = outerScrollOffset.value;
        }
      };
      _f._closure = {
        scrollTarget: scrollTarget,
        outerScrollOffset: outerScrollOffset,
      };
      _f.asString =
        "function _f(cur,prev){const{scrollTarget,outerScrollOffset}=jsThis._closure;{if(cur&&!prev){scrollTarget.value=outerScrollOffset.value;}}}";
      _f.__workletHash = 5863730252712;
      _f.__location =
        "/Users/cs/Code/react-native-draggable-flatlist/src/hooks/useNestedAutoScroll.tsx (83:4)";
      return _f;
    })(),
    [activeCellSize]
  );
  function scrollToInternal(y) {
    var _scrollableRef$curren;
    (_scrollableRef$curren = scrollableRef.current) == null
      ? void 0
      : _scrollableRef$curren.scrollTo({ y: y, animated: true });
  }
  (0, _reactNativeReanimated.useDerivedValue)(
    (function () {
      var _f = function _f() {
        var isAtEdge = isAtTopEdge.value || isAtBottomEdge.value;
        var topDisabled = isAtTopEdge.value && isScrolledUp.value;
        var bottomDisabled = isAtBottomEdge.value && isScrolledDown.value;
        var isEdgeDisabled = topDisabled || bottomDisabled;
        var scrollTargetDiff = Math.abs(
          scrollTarget.value - outerScrollOffset.value
        );
        var scrollInProgress =
          scrollTargetDiff > _constants.SCROLL_POSITION_TOLERANCE;
        var shouldScroll =
          isAtEdge &&
          !isEdgeDisabled &&
          isDraggingCell.value &&
          isTouchActiveNative.value &&
          !scrollInProgress;
        var distFromEdge = isAtTopEdge.value
          ? distToTopEdge.value
          : distToBottomEdge.value;
        var speedPct = 1 - distFromEdge / autoscrollThreshold;
        var offset = speedPct * autoscrollSpeed;
        var targetOffset = isAtTopEdge.value
          ? Math.max(0, outerScrollOffset.value - offset)
          : outerScrollOffset.value + offset;
        if (shouldScroll) {
          scrollTarget.value = targetOffset;
          (0, _reactNativeReanimated.runOnJS)(scrollToInternal)(targetOffset);
        }
      };
      _f._closure = {
        isAtTopEdge: isAtTopEdge,
        isAtBottomEdge: isAtBottomEdge,
        isScrolledUp: isScrolledUp,
        isScrolledDown: isScrolledDown,
        scrollTarget: scrollTarget,
        outerScrollOffset: outerScrollOffset,
        SCROLL_POSITION_TOLERANCE: _constants.SCROLL_POSITION_TOLERANCE,
        isDraggingCell: isDraggingCell,
        isTouchActiveNative: isTouchActiveNative,
        distToTopEdge: distToTopEdge,
        distToBottomEdge: distToBottomEdge,
        autoscrollThreshold: autoscrollThreshold,
        autoscrollSpeed: autoscrollSpeed,
        runOnJS: _reactNativeReanimated.runOnJS,
        scrollToInternal: scrollToInternal,
      };
      _f.asString =
        "function _f(){const{isAtTopEdge,isAtBottomEdge,isScrolledUp,isScrolledDown,scrollTarget,outerScrollOffset,SCROLL_POSITION_TOLERANCE,isDraggingCell,isTouchActiveNative,distToTopEdge,distToBottomEdge,autoscrollThreshold,autoscrollSpeed,runOnJS,scrollToInternal}=jsThis._closure;{const isAtEdge=isAtTopEdge.value||isAtBottomEdge.value;const topDisabled=isAtTopEdge.value&&isScrolledUp.value;const bottomDisabled=isAtBottomEdge.value&&isScrolledDown.value;const isEdgeDisabled=topDisabled||bottomDisabled;const scrollTargetDiff=Math.abs(scrollTarget.value-outerScrollOffset.value);const scrollInProgress=scrollTargetDiff>SCROLL_POSITION_TOLERANCE;const shouldScroll=isAtEdge&&!isEdgeDisabled&&isDraggingCell.value&&isTouchActiveNative.value&&!scrollInProgress;const distFromEdge=isAtTopEdge.value?distToTopEdge.value:distToBottomEdge.value;const speedPct=1-distFromEdge/autoscrollThreshold;const offset=speedPct*autoscrollSpeed;const targetOffset=isAtTopEdge.value?Math.max(0,outerScrollOffset.value-offset):outerScrollOffset.value+offset;if(shouldScroll){scrollTarget.value=targetOffset;runOnJS(scrollToInternal)(targetOffset);}}}";
      _f.__workletHash = 3348905696169;
      _f.__location =
        "/Users/cs/Code/react-native-draggable-flatlist/src/hooks/useNestedAutoScroll.tsx (95:18)";
      return _f;
    })(),
    [autoscrollSpeed, autoscrollThreshold, isDraggingCell]
  );
  return null;
}
//# sourceMappingURL=useNestedAutoScroll.js.map
