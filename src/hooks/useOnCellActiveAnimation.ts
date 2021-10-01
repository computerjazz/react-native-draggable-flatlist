import Animated, {
  block,
  clockRunning,
  cond,
  onChange,
  set,
  startClock,
  stopClock,
  useCode,
  useSharedValue,
} from "react-native-reanimated";
import { useAnimatedValues } from "../context/animatedValueContext";
import { useIsActive } from "../context/cellContext";
import { springFill } from "../procs";
import { useSpring } from "./useSpring";

type Params = {
  animationConfig: Partial<Animated.WithSpringConfig>;
};

export function useOnCellActiveAnimation(
  { animationConfig }: Params = { animationConfig: {} }
) {
  const onActiveAnim = useSharedValue(0);

  const { isDraggingCell } = useAnimatedValues();
  const isActive = useIsActive();

  return {
    isActive,
    onActiveAnim,
  };
}
