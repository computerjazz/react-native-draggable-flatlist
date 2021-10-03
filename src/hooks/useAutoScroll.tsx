import { useEffect, useRef } from "react";
import {
  scrollTo,
  useAnimatedReaction,
  useDerivedValue,
  useSharedValue,
  useValue,
} from "react-native-reanimated";
import { State as GestureState } from "react-native-gesture-handler";
import {
  DEFAULT_PROPS,
  SCROLL_POSITION_TOLERANCE,
  isReanimatedV2,
  isAndroid,
} from "../constants";
import { useProps } from "../context/propsContext";
import { useAnimatedValues } from "../context/animatedValueContext";
import { useRefs } from "../context/refContext";

export function useAutoScroll() {
  const { flatlistRef, scrollViewRef } = useRefs();

  const {
    autoscrollThreshold = DEFAULT_PROPS.autoscrollThreshold,
    autoscrollSpeed = DEFAULT_PROPS.autoscrollSpeed,
  } = useProps();

  const {
    scrollOffset,
    scrollViewSize,
    containerSize,
    hoverAnim,
    isDraggingCell,
    activeCellSize,
    panGestureState,
    horizontalAnim,
    hoverOffset,
    isTouchActiveNative,
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
  });

  useDerivedValue(() => {
    console.log(
      `dtop: ${distToTopEdge.value}, dbtm: ${distToBottomEdge.value}`
    );
    if (!shouldAutoScroll.value) return;

    const distFromEdge = isAtTopEdge.value
      ? distToTopEdge.value
      : distToBottomEdge.value;
    const speedPct = 1 - distFromEdge / autoscrollThreshold!;
    const offset = speedPct * autoscrollSpeed;
    const targetOffset = isAtTopEdge.value
      ? Math.max(10, scrollOffset.value - offset)
      : scrollOffset.value + offset;
    const targetX = horizontalAnim.value ? targetOffset : 0;
    const targetY = horizontalAnim.value ? 0 : targetOffset;

    scrollTarget.value = targetOffset;
    console.log("SCROLL TO", targetOffset);
    scrollTo(scrollViewRef, targetX, targetY, true);
  }, []);

  return null;
}
