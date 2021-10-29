import Animated, {
  useAnimatedReaction,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useStaticValues } from "../context/staticValueContext";
import { useIsActive } from "../context/cellContext";
import { useRef } from "react";
import { DEFAULT_ANIMATION_CONFIG } from "../constants";

type Params = {
  animationConfig: Partial<Animated.WithSpringConfig>;
};

export function useOnCellActiveAnimation(
  { animationConfig }: Params = { animationConfig: {} }
) {
  const animConfigRef = useRef(animationConfig);
  animConfigRef.current = animationConfig;
  const onActiveAnim = useSharedValue(0);
  const isActive = useIsActive();
  const { isPressedIn } = useStaticValues();

  useAnimatedReaction(
    () => {
      return isActive && isPressedIn.value;
    },
    (cur, prev) => {
      if (cur !== prev && prev !== null) {
        onActiveAnim.value = withSpring(
          cur ? 1 : 0,
          Object.assign({}, animConfigRef.current, DEFAULT_ANIMATION_CONFIG)
        );
      }
    },
    [isActive, isPressedIn, onActiveAnim]
  );

  return {
    isActive,
    onActiveAnim,
  };
}
