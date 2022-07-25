import Animated, {
  runOnJS,
  useAnimatedReaction,
  useDerivedValue,
  useSharedValue,
} from "react-native-reanimated";
import { State as GestureState } from "react-native-gesture-handler";
import { useSafeNestableScrollContainerContext } from "../context/nestableScrollContainerContext";
import { SCROLL_POSITION_TOLERANCE } from "../constants";

// This is mostly copied over from the main react-native-draggable-flatlist
// useAutoScroll hook with a few notable exceptions:
// - Since animated values are now coming in via a callback,
//   we won't guarantee they exist (and default them if not).
// - Outer scrollable is a ScrollView, not a FlatList
// TODO: see if we can combine into a single shared `useAutoScroll()` hook

export function useNestedAutoScroll(params: {
  activeCellSize?: Animated.SharedValue<number>;
  autoscrollSpeed?: number;
  autoscrollThreshold?: number;
  hoverOffset?: Animated.SharedValue<number>;
  isDraggingCell?: Animated.SharedValue<number>;
  isTouchActiveNative?: Animated.SharedValue<number>;
  panGestureState?: Animated.SharedValue<GestureState | number>;
}) {
  const {
    outerScrollOffset,
    containerSize,
    scrollableRef,
    scrollViewSize,
  } = useSafeNestableScrollContainerContext();

  const DUMMY_VAL = useSharedValue(0);

  const {
    hoverOffset = DUMMY_VAL,
    activeCellSize = DUMMY_VAL,
    autoscrollSpeed = 100,
    autoscrollThreshold = 30,
    isDraggingCell = DUMMY_VAL,
    isTouchActiveNative = DUMMY_VAL,
  } = params;

  const hoverScreenOffset = useDerivedValue(() => {
    return hoverOffset.value - outerScrollOffset.value;
  }, []);

  const isScrolledUp = useDerivedValue(() => {
    return outerScrollOffset.value - SCROLL_POSITION_TOLERANCE <= 0;
  }, []);

  const isScrolledDown = useDerivedValue(() => {
    return (
      outerScrollOffset.value + containerSize.value + SCROLL_POSITION_TOLERANCE >=
      scrollViewSize.value
    );
  }, []);

  const distToTopEdge = useDerivedValue(() => {
    return Math.max(0, hoverScreenOffset.value);
  }, [hoverScreenOffset]);

  const distToBottomEdge = useDerivedValue(() => {
    const dist = containerSize.value - (hoverScreenOffset.value + activeCellSize.value)
    return Math.max(0, dist);
  }, [hoverScreenOffset, activeCellSize, containerSize]);

  const isAtTopEdge = useDerivedValue(() => {
    return distToTopEdge.value <= autoscrollThreshold;
  }, []);

  const isAtBottomEdge = useDerivedValue(() => {
    return distToBottomEdge.value <= autoscrollThreshold;
  });

  const scrollTarget = useSharedValue(0);

  useAnimatedReaction(
    () => {
      return isDraggingCell.value;
    },
    (cur, prev) => {
      if (cur && !prev) {
        scrollTarget.value = outerScrollOffset.value;
      }
    },
    [activeCellSize]
  );

  function scrollToInternal(y: number) {
    scrollableRef.current?.scrollTo({ y, animated: true });
  }

  useDerivedValue(() => {
    const isAtEdge = isAtTopEdge.value || isAtBottomEdge.value;
    const topDisabled = isAtTopEdge.value && isScrolledUp.value;
    const bottomDisabled = isAtBottomEdge.value && isScrolledDown.value;
    const isEdgeDisabled = topDisabled || bottomDisabled;

    const scrollTargetDiff = Math.abs(scrollTarget.value - outerScrollOffset.value);
    const scrollInProgress = scrollTargetDiff > SCROLL_POSITION_TOLERANCE;

    const shouldScroll =
      isAtEdge &&
      !isEdgeDisabled &&
      isDraggingCell.value &&
      isTouchActiveNative.value &&
      !scrollInProgress;

    const distFromEdge = isAtTopEdge.value
      ? distToTopEdge.value
      : distToBottomEdge.value;
    const speedPct = 1 - distFromEdge / autoscrollThreshold;
    const offset = speedPct * autoscrollSpeed;
    const targetOffset = isAtTopEdge.value
      ? Math.max(0, outerScrollOffset.value - offset)
      : outerScrollOffset.value + offset;
    if (shouldScroll) {
      scrollTarget.value = targetOffset;
      // Reanimated scrollTo is crashing on android. use 'regular' scrollTo until figured out.
      // scrollTo(scrollViewRef, 0, scrollTarget.value, true)
      runOnJS(scrollToInternal)(targetOffset);
    }
  }, [autoscrollSpeed, autoscrollThreshold, isDraggingCell]);

  return null;
}
