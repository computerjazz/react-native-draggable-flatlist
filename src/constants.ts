// Fire onScrollComplete when within this many

import { PanGestureHandlerProperties } from "react-native-gesture-handler";
import Animated from "react-native-reanimated";

// px of target offset
export const SCROLL_POSITION_TOLERANCE = 2;
export const DEFAULT_ANIMATION_CONFIG: Animated.WithSpringConfig = {
  damping: 20,
  mass: 0.2,
  stiffness: 100,
  overshootClamping: false,
  restSpeedThreshold: 0.2,
  restDisplacementThreshold: 0.2,
};

export const DEFAULT_PROPS = {
  autoscrollThreshold: 30,
  autoscrollSpeed: 100,
  animationConfig: DEFAULT_ANIMATION_CONFIG,
  scrollEnabled: true,
  dragHitSlop: 0 as PanGestureHandlerProperties["hitSlop"],
  activationDistance: 0,
  dragItemOverflow: false,
};
