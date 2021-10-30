import { FlatList, ScrollView } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  scrollTo,
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
    scrollViewSize,
    containerSize,
    activeCellOffset,
    activeCellSize,
  } = useStaticValues();

  const {
    autoscrollThreshold = DEFAULT_PROPS.autoscrollThreshold,
    autoscrollSpeed = DEFAULT_PROPS.autoscrollSpeed,
  } = propsRef.current;

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
