import { useEffect } from "react";
import Animated, {
  useDerivedValue,
  useSharedValue,
  withSpring,
  WithSpringConfig,
} from "react-native-reanimated";
import { DEFAULT_ANIMATION_CONFIG } from "../constants";
import { useAnimatedValues } from "../context/animatedValueContext";
import { useIsActive } from "../context/cellContext";

type Params = {
  animationConfig: Partial<WithSpringConfig>;
};

export function useOnCellActiveAnimation(
  { animationConfig }: Params = { animationConfig: {} }
) {
  const animationConfigRef = useSharedValue(animationConfig);

  useEffect(() => {
    animationConfigRef.value = animationConfig;
  }, [animationConfig]);

  const isActive = useIsActive();

  const { isTouchActiveNative } = useAnimatedValues();

  const onActiveAnim = useDerivedValue(() => {
    const toVal = isActive && isTouchActiveNative.value ? 1 : 0;
    return withSpring(toVal, {
      ...DEFAULT_ANIMATION_CONFIG,
      ...animationConfigRef.value,
    } as WithSpringConfig);
  }, [isActive]);

  return {
    isActive,
    onActiveAnim,
  };
}
