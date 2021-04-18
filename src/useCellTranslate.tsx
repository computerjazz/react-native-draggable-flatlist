import { useState } from "react";
import Animated, {
  runOnJS,
  useAnimatedReaction,
  useDerivedValue,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useActiveKey, useStaticValues } from "./context";

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
    isHovering,
    spacerIndexAnim,
    placeholderOffset,
    animationConfigRef,
    hoverComponentTranslate,
    scrollOffset,
  } = useStaticValues();

  const { isActiveVisible } = useActiveKey();

  const isActiveCell = useDerivedValue(() => {
    return cellIndex.value === activeIndexAnim.value;
  });

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
        placeholderOffset.value = newPlaceholderOffset;
      }
    }
  );

  const translate = useDerivedValue(() => {
    // Active cell follows touch
    if (isActiveCell.value)
      return (
        hoverComponentTranslate.value - cellOffset.value + scrollOffset.value
      );
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

  const lastKnownTranslate = useSharedValue(0);
  useDerivedValue(() => {
    if (!isActiveVisible) lastKnownTranslate.value = 0;
  });

  const springTranslate = useDerivedValue(() => {
    if (translate.value) lastKnownTranslate.value = translate.value;
    if (isActiveCell.value) return translate.value;
    return isHovering.value
      ? withSpring(translate.value, animationConfigRef.current)
      : isActiveVisible
      ? lastKnownTranslate.value
      : 0;
  });

  return springTranslate;
}
