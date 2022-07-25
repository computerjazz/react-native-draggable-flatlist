import {
  runOnJS,
  useAnimatedReaction,
  useDerivedValue,
  useSharedValue,
} from "react-native-reanimated";
import { DEFAULT_PROPS, SCROLL_POSITION_TOLERANCE } from "../constants";
import { useProps } from "../context/propsContext";
import { useAnimatedValues } from "../context/animatedValueContext";
import { useRefs } from "../context/refContext";

export function useAutoScroll() {
  const { flatlistRef } = useRefs();

  const {
    autoscrollThreshold = DEFAULT_PROPS.autoscrollThreshold,
    autoscrollSpeed = DEFAULT_PROPS.autoscrollSpeed,
  } = useProps();

  const {
    scrollOffset,
    scrollViewSize,
    containerSize,
    activeCellSize,
    hoverOffset,
    activeIndexAnim,
  } = useAnimatedValues();

  const hoverScreenOffset = useDerivedValue(() => {
    return hoverOffset.value - scrollOffset.value;
  }, []);

  const isScrolledUp = useDerivedValue(() => {
    return scrollOffset.value - SCROLL_POSITION_TOLERANCE <= 0;
  }, []);

  const isScrolledDown = useDerivedValue(() => {
    return (
      scrollOffset.value + containerSize.value + SCROLL_POSITION_TOLERANCE >=
      scrollViewSize.value
    );
  }, []);

  const distToTopEdge = useDerivedValue(() => {
    return Math.max(0, hoverScreenOffset.value);
  }, []);

  const distToBottomEdge = useDerivedValue(() => {
    const hoverPlusActiveCell = hoverScreenOffset.value + activeCellSize.value;
    return Math.max(0, containerSize.value - hoverPlusActiveCell);
  }, []);

  const isAtTopEdge = useDerivedValue(() => {
    return distToTopEdge.value <= autoscrollThreshold;
  });

  const isAtBottomEdge = useDerivedValue(() => {
    return distToBottomEdge.value <= autoscrollThreshold;
  }, []);

  const scrollTarget = useSharedValue(0);
  const dragIsActive = useDerivedValue(() => {
    return activeIndexAnim.value >= 0;
  }, []);

  useAnimatedReaction(
    () => {
      return dragIsActive.value;
    },
    (cur, prev) => {
      if (cur && !prev) {
        scrollTarget.value = scrollOffset.value;
      }
    }
  );

  const shouldAutoScroll = useDerivedValue(() => {
    const scrollTargetDiff = Math.abs(scrollTarget.value - scrollOffset.value);
    const hasScrolledToTarget = scrollTargetDiff < SCROLL_POSITION_TOLERANCE;

    const isAtEdge = isAtTopEdge.value || isAtBottomEdge.value;
    const topDisabled = isAtTopEdge.value && isScrolledUp.value;
    const bottomDisabled = isAtBottomEdge.value && isScrolledDown.value;
    const isEdgeDisabled = topDisabled || bottomDisabled;

    const cellIsActive = activeIndexAnim.value >= 0;

    return hasScrolledToTarget && isAtEdge && !isEdgeDisabled && cellIsActive;
  }, []);

  function scrollToInternal(offset: number) {
    if (flatlistRef && "current" in flatlistRef) {
      flatlistRef.current?.scrollToOffset({ offset, animated: true });
    }
  }

  useDerivedValue(() => {
    if (!shouldAutoScroll.value) return;

    const distFromEdge = isAtTopEdge.value
      ? distToTopEdge.value
      : distToBottomEdge.value;
    const speedPct = 1 - distFromEdge / autoscrollThreshold!;
    const offset = speedPct * autoscrollSpeed;
    const targetOffset = isAtTopEdge.value
      ? Math.max(0, scrollOffset.value - offset)
      : Math.min(
          scrollOffset.value + offset,
          scrollViewSize.value - containerSize.value
        );

    scrollTarget.value = targetOffset;
    // Reanimated scrollTo is crashing on android. use 'regular' scrollTo until figured out.
    // scrollTo(scrollViewRef, targetX, targetY, true);
    runOnJS(scrollToInternal)(targetOffset);
  }, []);

  return null;
}
