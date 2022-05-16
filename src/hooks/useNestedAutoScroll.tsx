import Animated, {
  runOnJS,
  useAnimatedReaction,
  useDerivedValue,
  useSharedValue,
} from "react-native-reanimated";
import { State as GestureState } from "react-native-gesture-handler";
import { useNestableScrollContainerContext } from "../context/nestableScrollContainerContext";
import { SCROLL_POSITION_TOLERANCE } from "../constants";

// This is mostly copied over from the main react-native-draggable-flatlist
// useAutoScroll hook with a few notable exceptions:
// - Since Animated.Values are now coming from the caller,
//   we won't guarantee they exist and default if not.
// - Outer scrollable is a ScrollView, not a FlatList
// TODO: see if we can combine into a single `useAutoScroll()` hook

export function useNestedAutoScroll(params: {
  activeCellSize?: Animated.SharedValue<number>;
  autoscrollSpeed?: number;
  autoscrollThreshold?: number;
  hoverAnim?: Animated.SharedValue<number>;
  isDraggingCell?: Animated.SharedValue<number>;
  isTouchActiveNative?: Animated.SharedValue<number>;
  panGestureState?: Animated.SharedValue<GestureState | number>;
}) {
  const {
    outerScrollOffset,
    containerSize,
    scrollableRef,
    scrollViewSize,
  } = useNestableScrollContainerContext();

  const DUMMY_VAL = useSharedValue(0);

  const {
    activeCellSize = DUMMY_VAL,
    autoscrollSpeed = 100,
    autoscrollThreshold = 30,
    hoverAnim = DUMMY_VAL,
    isDraggingCell = DUMMY_VAL,
    isTouchActiveNative = DUMMY_VAL,
  } = params;

  const scrollOffset = outerScrollOffset;

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
    return Math.max(0, hoverAnim.value - scrollOffset.value);
  }, [hoverAnim]);

  const distToBottomEdge = useDerivedValue(() => {
    const hoverMinusScroll = hoverAnim.value - scrollOffset.value;
    return Math.max(
      0,
      containerSize.value - (hoverMinusScroll + activeCellSize.value)
    );
  }, []);

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
        scrollTarget.value = scrollOffset.value;
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

    const scrollTargetDiff = Math.abs(scrollTarget.value - scrollOffset.value);
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
      ? Math.max(0, scrollOffset.value - offset)
      : scrollOffset.value + offset;
    if (shouldScroll) {
      scrollTarget.value = targetOffset;
      // Reanimated scrollTo is crashing on android. use 'regular' scrollTo until figured out.
      // scrollTo(scrollViewRef, 0, scrollTarget.value, true)
      console.log("SCROLL TO!!", targetOffset)
      runOnJS(scrollToInternal)(targetOffset);
    }
  }, [autoscrollSpeed, autoscrollThreshold, isDraggingCell]);

  return null;
}
