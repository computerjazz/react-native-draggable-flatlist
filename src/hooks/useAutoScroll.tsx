import { FlatList, ScrollView } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  scrollTo,
  useDerivedValue,
  useSharedValue,
} from "react-native-reanimated";
import { DEFAULT_PROPS, SCROLL_POSITION_TOLERANCE } from "../constants";

type Params = {
  scrollOffset: Animated.SharedValue<number>;
  scrollViewSize: Animated.SharedValue<number>;
  containerSize: Animated.SharedValue<number>;
  hoverComponentTranslate: Animated.DerivedValue<number>;
  isPressedIn: Animated.SharedValue<boolean>;
  activeCellSize: Animated.SharedValue<number>;
  scrollViewRef: React.RefObject<ScrollView>;
  autoscrollThreshold?: number;
  autoscrollSpeed?: number;
};

export function useAutoScroll({
  scrollOffset,
  scrollViewSize,
  containerSize,
  hoverComponentTranslate,
  isPressedIn,
  activeCellSize,
  scrollViewRef,
  autoscrollThreshold = DEFAULT_PROPS.autoscrollThreshold,
  autoscrollSpeed = DEFAULT_PROPS.autoscrollSpeed,
}: Params) {
  const scrollTarget = useSharedValue(0);

  const isScrolling = useDerivedValue(() => {
    const scrollTargetDiff = scrollTarget.value - scrollOffset.value;
    return Math.abs(scrollTargetDiff) > SCROLL_POSITION_TOLERANCE;
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
    return Math.max(0, hoverComponentTranslate.value);
  }, []);

  const distToBottomEdge = useDerivedValue(() => {
    return Math.max(
      0,
      containerSize.value -
        (hoverComponentTranslate.value + activeCellSize.value)
    );
  }, []);

  useDerivedValue(() => {
    if (isPressedIn.value) {
      if (distToBottomEdge.value < autoscrollThreshold) {
        if (!isScrolling.value) {
          scrollTarget.value = scrollOffset.value + 100;
          scrollTo(scrollViewRef, 0, scrollTarget.value, true);
        }
      }
    } else {
      scrollTarget.value = scrollOffset.value;
    }
  }, []);
}
