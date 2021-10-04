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

  useAnimatedReaction(
    () => {
      return (
        isHovering.value &&
        activeIndexAnim.value &&
        activeCellSize.value &&
        hoverOffset.value
      );
    },
    () => {
      // Determining spacer index is hard to visualize. See diagram: https://i.imgur.com/jRPf5t3.jpg
      const isBeforeActive = cellIndex.value < activeIndexAnim.value;
      const isAfterActive = cellIndex.value > activeIndexAnim.value;

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

      if (
        result !== -1 &&
        isHovering.value &&
        result !== spacerIndexAnim.value
      ) {
        spacerIndexAnim.value = result;
      }
      if (!isHovering.value && spacerIndexAnim.value !== -1) {
        spacerIndexAnim.value = -1;
      }
      return spacerIndexAnim.value;
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
    // Active cell follows touch
    if (isActiveCell.value) {
      return hoverAnim.value;
    }
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
  }, [isActiveCell, activeIndexAnim, spacerIndexAnim, touchPositionDiff]);

  const springTranslate = useDerivedValue(() => {
    if (isActiveCell.value) return translate.value;
    return isHovering.value
      ? withSpring(translate.value, animationConfigRef.current)
      : translate.value;
  }, []);

  return springTranslate;
}
