import {
  useAnimatedReaction,
  useDerivedValue,
  withSpring,
} from "react-native-reanimated";
import { useStaticValues } from "./DraggableFlatListContext";

export function useCellTranslate({ cellIndex, cellSize, cellOffset }) {
  const {
    activeIndexAnim,
    activeCellSize,
    hoverOffset,
    isHovering,
    spacerIndexAnim,
    placeholderOffset,
    scrollOffset,
    animationConfigRef,
  } = useStaticValues();

  useDerivedValue(() => {
    // Determining spacer index is hard to visualize. See diagram: https://i.imgur.com/jRPf5t3.jpg
    const isAfterActive = cellIndex.value > activeIndexAnim.value;
    const isBeforeActive = cellIndex.value < activeIndexAnim.value;
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
        result = cellIndex.value - 1;
      } else if (
        hoverPlusActiveSize >= offsetPlusHalfSize &&
        hoverPlusActiveSize < offsetPlusSize
      ) {
        // bottom edge of active cell overlaps bottom half of current cell
        result = cellIndex.value;
      }
    } else if (isBeforeActive) {
      if (
        hoverOffset.value < offsetPlusSize &&
        hoverOffset.value >= offsetPlusHalfSize
      ) {
        // top edge of active cell overlaps bottom half of current cell
        result = cellIndex.value + 1;
      } else if (
        hoverOffset.value >= cellOffset.value &&
        hoverOffset.value < offsetPlusHalfSize
      ) {
        // top edge of active cell overlaps top half of current cell
        result = cellIndex.value;
      }
    }

    if (result !== -1 && isHovering.value && result !== spacerIndexAnim.value) {
      spacerIndexAnim.value = result;
    }
    if (!isHovering.value && spacerIndexAnim.value !== -1) {
      spacerIndexAnim.value = -1;
    }
    return spacerIndexAnim.value;
  }, []);

  useAnimatedReaction(
    () => {
      const isActiveSpacerIndex =
        isHovering.value &&
        cellSize.value !== -1 &&
        cellOffset.value !== -1 &&
        spacerIndexAnim.value === cellIndex.value;
      return isActiveSpacerIndex;
    },
    (result, prev) => {
      if (result && result !== prev) {
        const isAfterActive = cellIndex.value > activeIndexAnim.value;
        const newPlaceholderOffset = isAfterActive
          ? cellSize.value + (cellOffset.value - activeCellSize.value)
          : cellOffset.value;
        placeholderOffset.value = newPlaceholderOffset - scrollOffset.value;
      }
    }
  );

  const translate = useDerivedValue(() => {
    // Translate cell down if it is before active index and active cell has passed it.
    // Translate cell up if it is after the active index and active cell has passed it.
    const isAfterActive = cellIndex.value > activeIndexAnim.value;
    const shouldTranslate = isAfterActive
      ? cellIndex.value <= spacerIndexAnim.value
      : cellIndex.value >= spacerIndexAnim.value;

    if (shouldTranslate) {
      return activeCellSize.value * (isAfterActive ? -1 : 1);
    } else {
      return 0;
    }
  });

  const springTranslate = useDerivedValue(() => {
    return isHovering.value
      ? withSpring(translate.value, animationConfigRef.current)
      : 0;
  });

  return springTranslate;
}
