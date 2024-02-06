Object.defineProperty(exports, "__esModule", { value: true });
exports.useCellTranslate = useCellTranslate;
var _reactNativeReanimated = require("react-native-reanimated");
var _animatedValueContext = require("../context/animatedValueContext");
var _draggableFlatListContext = require("../context/draggableFlatListContext");
var _refContext = require("../context/refContext");
function useCellTranslate(_ref) {
  var cellIndex = _ref.cellIndex,
    cellSize = _ref.cellSize,
    cellOffset = _ref.cellOffset;
  var _useAnimatedValues = (0, _animatedValueContext.useAnimatedValues)(),
    activeIndexAnim = _useAnimatedValues.activeIndexAnim,
    activeCellSize = _useAnimatedValues.activeCellSize,
    hoverOffset = _useAnimatedValues.hoverOffset,
    spacerIndexAnim = _useAnimatedValues.spacerIndexAnim,
    placeholderOffset = _useAnimatedValues.placeholderOffset,
    hoverAnim = _useAnimatedValues.hoverAnim,
    viewableIndexMin = _useAnimatedValues.viewableIndexMin,
    viewableIndexMax = _useAnimatedValues.viewableIndexMax;
  var _useDraggableFlatList = (0,
    _draggableFlatListContext.useDraggableFlatListContext)(),
    activeKey = _useDraggableFlatList.activeKey;
  var _useRefs = (0, _refContext.useRefs)(),
    animationConfigRef = _useRefs.animationConfigRef;
  var translate = (0, _reactNativeReanimated.useDerivedValue)(
    (function () {
      var _f = function _f() {
        var isActiveCell = cellIndex === activeIndexAnim.value;
        var isOutsideViewableRange =
          !isActiveCell &&
          (cellIndex < viewableIndexMin.value ||
            cellIndex > viewableIndexMax.value);
        if (!activeKey || activeIndexAnim.value < 0 || isOutsideViewableRange) {
          return 0;
        }
        var isBeforeActive = cellIndex < activeIndexAnim.value;
        var isAfterActive = cellIndex > activeIndexAnim.value;
        var hoverPlusActiveSize = hoverOffset.value + activeCellSize.value;
        var offsetPlusHalfSize = cellOffset.value + cellSize.value / 2;
        var offsetPlusSize = cellOffset.value + cellSize.value;
        var result = -1;
        if (isAfterActive) {
          if (
            hoverPlusActiveSize >= cellOffset.value &&
            hoverPlusActiveSize < offsetPlusHalfSize
          ) {
            result = cellIndex - 1;
          } else if (
            hoverPlusActiveSize >= offsetPlusHalfSize &&
            hoverPlusActiveSize < offsetPlusSize
          ) {
            result = cellIndex;
          }
        } else if (isBeforeActive) {
          if (
            hoverOffset.value < offsetPlusSize &&
            hoverOffset.value >= offsetPlusHalfSize
          ) {
            result = cellIndex + 1;
          } else if (
            hoverOffset.value >= cellOffset.value &&
            hoverOffset.value < offsetPlusHalfSize
          ) {
            result = cellIndex;
          }
        }
        if (result !== -1 && result !== spacerIndexAnim.value) {
          spacerIndexAnim.value = result;
        }
        if (spacerIndexAnim.value === cellIndex) {
          var newPlaceholderOffset = isAfterActive
            ? cellSize.value + (cellOffset.value - activeCellSize.value)
            : cellOffset.value;
          placeholderOffset.value = newPlaceholderOffset;
        }
        if (isActiveCell) {
          return hoverAnim.value;
        }
        var shouldTranslate = isAfterActive
          ? cellIndex <= spacerIndexAnim.value
          : cellIndex >= spacerIndexAnim.value;
        var translationAmt = shouldTranslate
          ? activeCellSize.value * (isAfterActive ? -1 : 1)
          : 0;
        return (0, _reactNativeReanimated.withSpring)(
          translationAmt,
          animationConfigRef.current
        );
      };
      _f._closure = {
        cellIndex: cellIndex,
        activeIndexAnim: activeIndexAnim,
        viewableIndexMin: viewableIndexMin,
        viewableIndexMax: viewableIndexMax,
        activeKey: activeKey,
        hoverOffset: hoverOffset,
        activeCellSize: activeCellSize,
        cellOffset: cellOffset,
        cellSize: cellSize,
        spacerIndexAnim: spacerIndexAnim,
        placeholderOffset: placeholderOffset,
        hoverAnim: hoverAnim,
        withSpring: _reactNativeReanimated.withSpring,
        animationConfigRef: { current: animationConfigRef.current },
      };
      _f.asString =
        "function _f(){const{cellIndex,activeIndexAnim,viewableIndexMin,viewableIndexMax,activeKey,hoverOffset,activeCellSize,cellOffset,cellSize,spacerIndexAnim,placeholderOffset,hoverAnim,withSpring,animationConfigRef}=jsThis._closure;{const isActiveCell=cellIndex===activeIndexAnim.value;const isOutsideViewableRange=!isActiveCell&&(cellIndex<viewableIndexMin.value||cellIndex>viewableIndexMax.value);if(!activeKey||activeIndexAnim.value<0||isOutsideViewableRange){return 0;}const isBeforeActive=cellIndex<activeIndexAnim.value;const isAfterActive=cellIndex>activeIndexAnim.value;const hoverPlusActiveSize=hoverOffset.value+activeCellSize.value;const offsetPlusHalfSize=cellOffset.value+cellSize.value/2;const offsetPlusSize=cellOffset.value+cellSize.value;let result=-1;if(isAfterActive){if(hoverPlusActiveSize>=cellOffset.value&&hoverPlusActiveSize<offsetPlusHalfSize){result=cellIndex-1;}else if(hoverPlusActiveSize>=offsetPlusHalfSize&&hoverPlusActiveSize<offsetPlusSize){result=cellIndex;}}else if(isBeforeActive){if(hoverOffset.value<offsetPlusSize&&hoverOffset.value>=offsetPlusHalfSize){result=cellIndex+1;}else if(hoverOffset.value>=cellOffset.value&&hoverOffset.value<offsetPlusHalfSize){result=cellIndex;}}if(result!==-1&&result!==spacerIndexAnim.value){spacerIndexAnim.value=result;}if(spacerIndexAnim.value===cellIndex){const newPlaceholderOffset=isAfterActive?cellSize.value+(cellOffset.value-activeCellSize.value):cellOffset.value;placeholderOffset.value=newPlaceholderOffset;}if(isActiveCell){return hoverAnim.value;}const shouldTranslate=isAfterActive?cellIndex<=spacerIndexAnim.value:cellIndex>=spacerIndexAnim.value;const translationAmt=shouldTranslate?activeCellSize.value*(isAfterActive?-1:1):0;return withSpring(translationAmt,animationConfigRef.current);}}";
      _f.__workletHash = 883167536212;
      _f.__location =
        "/Users/cs/Code/react-native-draggable-flatlist/src/hooks/useCellTranslate.tsx (28:36)";
      return _f;
    })(),
    [activeKey, cellIndex]
  );
  return translate;
}
//# sourceMappingURL=useCellTranslate.js.map
