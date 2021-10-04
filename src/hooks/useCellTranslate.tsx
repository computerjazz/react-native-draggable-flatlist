import Animated, {
  useAnimatedReaction,
  useDerivedValue,
  withSpring,
} from "react-native-reanimated";
import { useAnimatedValues } from "../context/animatedValueContext";
import { useRefs } from "../context/refContext";

type Params = {
  cellIndex: Animated.SharedValue<number>;
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
    touchPositionDiff,
    hoverAnim,
  } = useAnimatedValues();

  const { animationConfigRef } = useRefs();

  const isActiveCell = useDerivedValue(() => {
    return cellIndex.value === activeIndexAnim.value;
  }, []);

  const isHovering = useDerivedValue(() => {
    return activeIndexAnim.value >= 0;
  }, []);

  const hoverAnimConstrained = useDerivedValue(() => {
    const minRelevantValue = cellOffset.value - activeCellSize.value * 2;
    const maxRelevantValue =
      cellOffset.value + cellSize.value + activeCellSize.value * 2;
    const hoverAnimConstrained = Math.max(
      Math.min(maxRelevantValue, hoverOffset.value),
      minRelevantValue
    );
    return hoverAnimConstrained;
  });

  useAnimatedReaction(
    () => {
      return hoverAnimConstrained.value;
    },
    (hoverAnimConstrained, prev) => {
      if (!isHovering.value || hoverAnimConstrained === prev) {
        return;
      }

      // Determining spacer index is hard to visualize. See diagram: https://i.imgur.com/jRPf5t3.jpg
      const isBeforeActive = cellIndex.value < activeIndexAnim.value;
      const isAfterActive = cellIndex.value > activeIndexAnim.value;

      const hoverPlusActiveSize = hoverAnimConstrained + activeCellSize.value;
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
          hoverAnimConstrained < offsetPlusSize &&
          hoverAnimConstrained >= offsetPlusHalfSize
        ) {
          // top edge of active cell overlaps bottom half of current cell
          result = cellIndex.value + 1;
        } else if (
          hoverAnimConstrained >= cellOffset.value &&
          hoverAnimConstrained < offsetPlusHalfSize
        ) {
          // top edge of active cell overlaps top half of current cell
          result = cellIndex.value;
        }
      }

      if (result !== -1 && result !== spacerIndexAnim.value) {
        spacerIndexAnim.value = result;
      }
    },
    []
  );

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
        placeholderOffset.value = newPlaceholderOffset;
      }
    },
    []
  );

  const translate = useDerivedValue(() => {
    // If no active cell, translation is already 0
    if (!isHovering.value) return 0;

    // Active cell follows touch
    if (isActiveCell.value) return hoverAnim.value;

    // Translate cell down if it is before active index and active cell has passed it.
    // Translate cell up if it is after the active index and active cell has passed it.
    const isAfterActive = cellIndex.value > activeIndexAnim.value;
    const shouldTranslate = isAfterActive
      ? cellIndex.value <= spacerIndexAnim.value
      : cellIndex.value >= spacerIndexAnim.value;

    const translationAmt = shouldTranslate
      ? activeCellSize.value * (isAfterActive ? -1 : 1)
      : 0;
    return withSpring(translationAmt, animationConfigRef.current);
  }, [isActiveCell, activeIndexAnim, spacerIndexAnim, touchPositionDiff]);

  return translate;
}
