import { Platform } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import Animated, {
  scrollTo,
  useDerivedValue,
  useSharedValue,
} from "react-native-reanimated";
import { DEFAULT_PROPS, SCROLL_POSITION_TOLERANCE } from "./constants";

type Params = {
  scrollOffset: Animated.SharedValue<number>;
  scrollViewSize: Animated.SharedValue<number>;
  containerSize: Animated.SharedValue<number>;
  hoverAnim: Animated.SharedValue<number>;
  isHovering: Animated.SharedValue<boolean>;
  activeCellSize: Animated.SharedValue<number>;
  flatlistRef: React.RefObject<FlatList<any>>;
  horizontal: boolean;
  autoscrollThreshold?: number;
  autoscrollSpeed?: number;
};

export function useAutoScroll({
  scrollOffset,
  scrollViewSize,
  containerSize,
  hoverAnim,
  isHovering,
  activeCellSize,
  flatlistRef,
  horizontal,
  autoscrollThreshold = DEFAULT_PROPS.autoscrollThreshold,
  autoscrollSpeed = DEFAULT_PROPS.autoscrollSpeed,
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

  const prevScrollTarget = useSharedValue(0);

  const scrollTarget = useDerivedValue(() => {
    const scrollUp = distToTopEdge.value < autoscrollThreshold!;
    const scrollDown = distToBottomEdge.value < autoscrollThreshold!;
    const attemptToScroll = scrollUp || scrollDown;
    if (
      !isHovering.value ||
      !attemptToScroll ||
      (scrollUp && isScrolledUp.value) ||
      (scrollDown && isScrolledDown.value)
    ) {
      return -1;
    }

    const distFromEdge = scrollUp
      ? distToTopEdge.value
      : distToBottomEdge.value;
    const speedPct = 1 - distFromEdge / autoscrollThreshold!;
    // Android scroll speed seems much faster than ios
    const speed =
      Platform.OS === "ios" ? autoscrollSpeed : autoscrollSpeed / 10;
    const offset = speedPct * speed;
    const targetOffset = scrollUp
      ? Math.max(0, scrollOffset.value - offset)
      : scrollOffset.value + offset;
    return targetOffset;
  });

  useDerivedValue(() => {
    if (
      scrollTarget.value !== -1 &&
      scrollTarget.value !== prevScrollTarget.value
    ) {
      prevScrollTarget.value = scrollTarget.value;
      scrollTo(
        flatlistRef,
        horizontal ? scrollTarget.value : 0,
        horizontal ? 0 : scrollTarget.value,
        true
      );
    }
  });
}
