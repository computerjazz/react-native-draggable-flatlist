import Animated, { useDerivedValue, withSpring } from "react-native-reanimated";
import { useAnimatedValues } from "../context/animatedValueContext";
import { useDraggableFlatListContext } from "../context/draggableFlatListContext";
import { useRefs } from "../context/refContext";

type Params = {
  cellIndex: number;
  cellSize: Animated.SharedValue<number>;
  cellOffset: Animated.SharedValue<number>;
};

export function useCellTranslate({ cellIndex, cellSize, cellOffset }: Params) {
  const {
    activeIndexAnim,
    activeCellSize,
    hoverOffset,
    spacerIndexAnim,
    placeholderOffset,
    hoverAnim,
    viewableIndexMin,
    viewableIndexMax,
    lockedIndicesAnim,
    cellSizesAnim,
  } = useAnimatedValues();

  const { activeKey } = useDraggableFlatListContext();

  const { animationConfigRef } = useRefs();

  const translate = useDerivedValue(() => {
    const isActiveCell = cellIndex === activeIndexAnim.value;
    const isOutsideViewableRange =
      !isActiveCell &&
      (cellIndex < viewableIndexMin.value ||
        cellIndex > viewableIndexMax.value);
    if (!activeKey || activeIndexAnim.value < 0 || isOutsideViewableRange) {
      return 0;
    }

    const isLockedCell = lockedIndicesAnim.value[cellIndex] === true;
    if (isLockedCell && !isActiveCell) {
      return 0;
    }

    // Determining spacer index is hard to visualize. See diagram: https://i.imgur.com/jRPf5t3.jpg
    const isBeforeActive = cellIndex < activeIndexAnim.value;
    const isAfterActive = cellIndex > activeIndexAnim.value;

    const hoverPlusActiveSize = hoverOffset.value + activeCellSize.value;
    const offsetPlusHalfSize = cellOffset.value + cellSize.value / 2;
    const offsetPlusSize = cellOffset.value + cellSize.value;
    let result = -1;

    if (isAfterActive) {
      if (
        hoverPlusActiveSize >= cellOffset.value &&
        hoverPlusActiveSize < offsetPlusHalfSize
      ) {
        // bottom edge of active cell overlaps top half of current cell
        result = cellIndex - 1;
      } else if (
        hoverPlusActiveSize >= offsetPlusHalfSize &&
        hoverPlusActiveSize < offsetPlusSize
      ) {
        // bottom edge of active cell overlaps bottom half of current cell
        result = cellIndex;
      }
    } else if (isBeforeActive) {
      if (
        hoverOffset.value < offsetPlusSize &&
        hoverOffset.value >= offsetPlusHalfSize
      ) {
        // top edge of active cell overlaps bottom half of current cell
        result = cellIndex + 1;
      } else if (
        hoverOffset.value >= cellOffset.value &&
        hoverOffset.value < offsetPlusHalfSize
      ) {
        // top edge of active cell overlaps top half of current cell
        result = cellIndex;
      }
    }

    if (result !== -1) {
      const len = lockedIndicesAnim.value.length;
      if (len === 0) {
        if (result !== spacerIndexAnim.value) {
          spacerIndexAnim.value = result;
        }
      } else {
        let adjusted = result;
        const movingForward = result >= activeIndexAnim.value;
        while (
          adjusted >= 0 &&
          adjusted < len &&
          lockedIndicesAnim.value[adjusted] === true
        ) {
          adjusted = movingForward ? adjusted + 1 : adjusted - 1;
        }
        if (
          adjusted >= 0 &&
          adjusted < len &&
          lockedIndicesAnim.value[adjusted] !== true &&
          adjusted !== spacerIndexAnim.value
        ) {
          spacerIndexAnim.value = adjusted;
        }
      }
    }

    if (spacerIndexAnim.value === cellIndex) {
      const newPlaceholderOffset = isAfterActive
        ? cellSize.value + (cellOffset.value - activeCellSize.value)
        : cellOffset.value;
      placeholderOffset.value = newPlaceholderOffset;
    }

    // Active cell follows touch
    if (isActiveCell) {
      return hoverAnim.value;
    }

    // Translate cell down if it is before active index and active cell has passed it.
    // Translate cell up if it is after the active index and active cell has passed it.

    const shouldTranslate = isAfterActive
      ? cellIndex <= spacerIndexAnim.value
      : cellIndex >= spacerIndexAnim.value;

    if (!shouldTranslate) {
      return withSpring(0, animationConfigRef.value);
    }

    if (lockedIndicesAnim.value.length === 0) {
      const translationAmt = activeCellSize.value * (isAfterActive ? -1 : 1);
      return withSpring(translationAmt, animationConfigRef.value);
    }

    const searchStep = isAfterActive ? -1 : 1;
    let targetIndex = cellIndex;
    let j = cellIndex + searchStep;
    while (j >= 0 && j < lockedIndicesAnim.value.length) {
      if (lockedIndicesAnim.value[j] !== true) {
        targetIndex = j;
        break;
      }
      j += searchStep;
    }

    let translationAmt = activeCellSize.value;
    const from = Math.min(cellIndex, targetIndex);
    const to = Math.max(cellIndex, targetIndex);
    for (let k = from + 1; k < to; k++) {
      translationAmt += cellSizesAnim.value[k] ?? activeCellSize.value;
    }
    translationAmt *= isAfterActive ? -1 : 1;
    return withSpring(translationAmt, animationConfigRef.value);
  }, [activeKey, cellIndex]);

  return translate;
}
