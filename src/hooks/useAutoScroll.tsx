import { FlatList } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useDerivedValue,
  useSharedValue,
} from "react-native-reanimated";
import { DEFAULT_PROPS, SCROLL_POSITION_TOLERANCE } from "../constants";

type Params = {
  scrollOffset: Animated.SharedValue<number>;
  scrollViewSize: Animated.SharedValue<number>;
  containerSize: Animated.SharedValue<number>;
  hoverAnim: Animated.SharedValue<number>;
  isPressedIn: Animated.SharedValue<boolean>;
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
  isPressedIn,
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
    const scrollUp =
      isPressedIn.value && distToTopEdge.value < autoscrollThreshold;
    const scrollDown =
      isPressedIn.value && (distToBottomEdge.value < autoscrollThreshold)!;
    const attemptToScroll = scrollUp || scrollDown;
    // console.log("SCROLL UP?", scrollUp)
    // console.log("SCROLL DOWN?", scrollDown)
    // console.log("PRESSED IN???", isPressedIn.value)
    if (
      !isPressedIn.value ||
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
    const offset = speedPct * autoscrollSpeed;
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
    if (!isPressedIn.value) {
      isAutoscrolling.value = false;
      return;
    }
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
