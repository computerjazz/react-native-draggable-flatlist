import Animated, { useDerivedValue } from "react-native-reanimated";
import { SCROLL_POSITION_TOLERANCE } from "./constants";

type Params = {
  scrollOffset: Animated.SharedValue<number>;
  scrollViewSize: Animated.SharedValue<number>;
  containerSize: Animated.SharedValue<number>;
  hoverAnim: Animated.SharedValue<number>;
  activeCellSize: Animated.SharedValue<number>;
};

export function useAutoScroll({
  scrollOffset,
  scrollViewSize,
  containerSize,
  hoverAnim,
  activeCellSize,
}: Params) {
  const isScrolledUp = useDerivedValue(() => {
    return scrollOffset.value - SCROLL_POSITION_TOLERANCE <= 0;
  });
  const isScrolledDown = useDerivedValue(() => {
    return (
      scrollOffset.value + containerSize.value + SCROLL_POSITION_TOLERANCE >=
      scrollViewSize.value
    );
  });

  const distToTopEdge = useDerivedValue(() => {
    return Math.max(0, hoverAnim.value);
  });

  const distToBottomEdge = useDerivedValue(() => {
    return Math.max(
      0,
      containerSize.value - (hoverAnim.value + activeCellSize.value)
    );
  });
}
