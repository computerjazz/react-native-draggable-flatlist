import Animated, {
  Extrapolate,
  interpolate,
  useDerivedValue,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useActiveKey, useStaticValues } from "../context";

type Params = {
  cellIndex: Animated.SharedValue<number>;
  cellSize: Animated.SharedValue<number>;
  cellOffset: Animated.SharedValue<number>;
  key: string;
};

export function useCellTranslate({
  key,
  cellIndex,
  cellSize,
  cellOffset,
}: Params) {
  const {
    activeIndexAnim,
    activeCellSize,
    hoverOffset,
    spacerIndexAnim,
    placeholderOffset,
    animationConfigRef,
    hoverComponentTranslate,
  } = useStaticValues();

  const { activeKey } = useActiveKey();

  const hoverClamped = useDerivedValue(() => {
    const range = [
      cellOffset.value - activeCellSize.value - 1,
      cellOffset.value + activeCellSize.value + 1,
    ];
    return interpolate(hoverOffset.value, range, range, Extrapolate.CLAMP);
  }, []);

  useDerivedValue(() => {
    // Determining spacer index is hard to visualize. See diagram: https://i.imgur.com/jRPf5t3.jpg
    const isAfterActive = cellIndex.value > activeIndexAnim.value;
    const isBeforeActive = cellIndex.value < activeIndexAnim.value;
    const hoverPlusActiveSize = hoverClamped.value + activeCellSize.value;
    const offsetPlusHalfSize = cellOffset.value + cellSize.value / 2;
    const offsetPlusSize = cellOffset.value + cellSize.value;
    let hoverIndex = -1;
    if (isAfterActive) {
      if (
        hoverPlusActiveSize >= cellOffset.value &&
        hoverPlusActiveSize < offsetPlusHalfSize
      ) {
        // bottom edge of active cell overlaps top half of current cell
        hoverIndex = cellIndex.value - 1;
      } else if (
        hoverPlusActiveSize >= offsetPlusHalfSize &&
        hoverPlusActiveSize < offsetPlusSize
      ) {
        // bottom edge of active cell overlaps bottom half of current cell
        hoverIndex = cellIndex.value;
      }
    } else if (isBeforeActive) {
      if (
        hoverClamped.value < offsetPlusSize &&
        hoverClamped.value >= offsetPlusHalfSize
      ) {
        // top edge of active cell overlaps bottom half of current cell
        hoverIndex = cellIndex.value + 1;
      } else if (
        hoverClamped.value >= cellOffset.value &&
        hoverClamped.value < offsetPlusHalfSize
      ) {
        // top edge of active cell overlaps top half of current cell
        hoverIndex = cellIndex.value;
      }
    }

    if (hoverIndex !== -1 && hoverIndex !== spacerIndexAnim.value) {
      spacerIndexAnim.value = hoverIndex;
    }

    if (cellIndex.value === spacerIndexAnim.value) {
      const newPlaceholderOffset = isAfterActive
        ? cellSize.value + (cellOffset.value - activeCellSize.value)
        : cellOffset.value;

      if (placeholderOffset.value !== newPlaceholderOffset) {
        placeholderOffset.value = newPlaceholderOffset;
      }
    }
  }, []);

  const translate = useDerivedValue(() => {
    const isAfterActive = cellIndex.value > activeIndexAnim.value;

    // Translate cell down if it is before active index and active cell has passed it.
    // Translate cell up if it is after the active index and active cell has passed it.

    const shouldTranslate = isAfterActive
      ? cellIndex.value <= spacerIndexAnim.value
      : cellIndex.value >= spacerIndexAnim.value;

    const translateVal = shouldTranslate
      ? activeCellSize.value * (isAfterActive ? -1 : 1)
      : 0;

    return withSpring(translateVal, animationConfigRef.current);
  }, [activeKey, cellIndex, activeIndexAnim, activeCellSize]);

  const noTranslate = useSharedValue(0);

  return !activeKey
    ? noTranslate
    : key === activeKey
    ? hoverComponentTranslate
    : translate;
}
