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

    if (result !== -1 && result !== spacerIndexAnim.value) {
      spacerIndexAnim.value = result;
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

    const translationAmt = shouldTranslate
      ? activeCellSize.value * (isAfterActive ? -1 : 1)
      : 0;

    return withSpring(translationAmt, animationConfigRef.current);
  }, [activeKey, cellIndex]);

  return translate;
}
