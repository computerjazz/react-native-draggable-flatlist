import { FlatList } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useDerivedValue,
  useSharedValue,
} from "react-native-reanimated";
import { DEFAULT_PROPS, SCROLL_POSITION_TOLERANCE, isIOS } from "./constants";

type Params = {
  scrollOffset: Animated.SharedValue<number>;
  scrollViewSize: Animated.SharedValue<number>;
  containerSize: Animated.SharedValue<number>;
  hoverAnim: Animated.SharedValue<number>;
  isHovering: Animated.SharedValue<boolean>;
  activeCellSize: Animated.SharedValue<number>;
  flatlistRef: React.RefObject<FlatList<any>>;
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

  const scrollTarget = useSharedValue(0);
  const isAutoscrolling = useSharedValue(false);

  const nextScrollTarget = useDerivedValue(() => {
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
    const speed = isIOS ? autoscrollSpeed : autoscrollSpeed / 10;
    const offset = speedPct * speed;
    const targetOffset = scrollUp
      ? Math.max(0, scrollOffset.value - offset)
      : scrollOffset.value + offset;
    return targetOffset;
  });

  useDerivedValue(() => {
    const hasReachedTarget =
      Math.abs(scrollOffset.value - scrollTarget.value) <
      SCROLL_POSITION_TOLERANCE;
    const hasReachedEdge = isScrolledUp.value || isScrolledDown.value;
    if (hasReachedTarget || hasReachedEdge) {
      isAutoscrolling.value = false;
    }
  });

  const jsScrollTo = ({ target }: { target: number }) => {
    flatlistRef.current?.scrollToOffset({ offset: target });
  };

  useDerivedValue(() => {
    if (!isHovering.value) isAutoscrolling.value = false;
    if (
      nextScrollTarget.value !== -1 &&
      nextScrollTarget.value !== scrollTarget.value &&
      !isAutoscrolling.value
    ) {
      isAutoscrolling.value = true;
      scrollTarget.value = nextScrollTarget.value;
      // Reanimated scrollTo has been really unstable, use custom js scrollTo for the time being
      runOnJS(jsScrollTo)({ target: scrollTarget.value });
    }
  });
}
