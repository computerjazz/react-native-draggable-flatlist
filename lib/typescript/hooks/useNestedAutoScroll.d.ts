import Animated from "react-native-reanimated";
import { State as GestureState } from "react-native-gesture-handler";
export declare function useNestedAutoScroll(params: {
  activeCellSize?: Animated.SharedValue<number>;
  autoscrollSpeed?: number;
  autoscrollThreshold?: number;
  hoverOffset?: Animated.SharedValue<number>;
  isDraggingCell?: Animated.SharedValue<number>;
  isTouchActiveNative?: Animated.SharedValue<number>;
  panGestureState?: Animated.SharedValue<GestureState | number>;
}): null;
