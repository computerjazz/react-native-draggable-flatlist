import { FlatList, ScrollView } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  scrollTo,
  useAnimatedReaction,
  useDerivedValue,
  useSharedValue,
} from "react-native-reanimated";
import { DEFAULT_PROPS, SCROLL_POSITION_TOLERANCE } from "../constants";
import { useStaticValues } from "../context";

export function useAutoScroll() {
  const {
    scrollOffset,
    hoverComponentTranslate,
    propsRef,
    isPressedIn,
    scrollViewRef,
    flatlistRef,
    scrollViewSize,
    containerSize,
    activeCellOffset,
    activeCellSize,
    horizontalAnim,
  } = useStaticValues();

  const {
    autoscrollThreshold = DEFAULT_PROPS.autoscrollThreshold,
    autoscrollSpeed = DEFAULT_PROPS.autoscrollSpeed,
  } = propsRef.current;

  const scrollTarget = useSharedValue(0);

  const isScrolling = useDerivedValue(() => {
    return (
      Math.abs(scrollOffset.value - scrollTarget.value) >
      SCROLL_POSITION_TOLERANCE
    );
  }, []);

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
    return Math.max(0, hoverComponentTranslate.value + activeCellOffset.value);
  }, []);

  const distToBottomEdge = useDerivedValue(() => {
    return Math.max(
      0,
      containerSize.value -
        (hoverComponentTranslate.value +
          activeCellOffset.value +
          activeCellSize.value -
          scrollOffset.value)
    );
  }, []);

  const nextScrollTarget = useDerivedValue(() => {
    if (isScrolling.value || !isPressedIn.value) return -1;
    const scrollUp = distToTopEdge.value < autoscrollThreshold!;
    const scrollDown = distToBottomEdge.value < autoscrollThreshold!;
    if (
      !(scrollUp || scrollDown) ||
      (scrollUp && isScrolledUp.value) ||
      (scrollDown && isScrolledDown.value)
    )
      return -1;
    const distFromEdge = scrollUp
      ? distToTopEdge.value
      : distToBottomEdge.value;
    const speedPct = 1 - distFromEdge / autoscrollThreshold!;
    const offset = speedPct * autoscrollSpeed;
    const targetOffset = scrollUp
      ? Math.max(0, scrollOffset.value - offset)
      : scrollOffset.value + offset;
    return targetOffset;
  }, []);

  useAnimatedReaction(
    () => {
      return nextScrollTarget.value;
    },
    (cur, prev) => {
      if (cur !== -1 && cur !== prev) {
        const xVal = horizontalAnim.value ? cur : 0;
        const yVal = horizontalAnim.value ? 0 : cur;
        scrollTarget.value = cur;
        scrollTo(flatlistRef, xVal, yVal, true);
      }
    },
    []
  );
}
