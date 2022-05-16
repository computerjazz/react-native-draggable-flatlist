import { useRef } from "react";
import Animated, { useDerivedValue, withSpring, WithSpringConfig } from "react-native-reanimated";
import { DEFAULT_ANIMATION_CONFIG } from "../constants";
import { useAnimatedValues } from "../context/animatedValueContext";
import { useIsActive } from "../context/cellContext";

type Params = {
  animationConfig: Partial<WithSpringConfig>;
};

export function useOnCellActiveAnimation(
  { animationConfig }: Params = { animationConfig: {} }
) {
  const animationConfigRef = useRef(animationConfig);
  animationConfigRef.current = animationConfig;

  const isActive = useIsActive();

  const { isTouchActiveNative } = useAnimatedValues();

  const onActiveAnim = useDerivedValue(() => {
    const toVal = isActive && isTouchActiveNative.value ? 1 : 0;
    const animConfig: Partial<WithSpringConfig> = {};

    // spread operator and Object.assign don't work within worklets
    for (let key in DEFAULT_ANIMATION_CONFIG) {
      const k = key as keyof WithSpringConfig;
      const v = DEFAULT_ANIMATION_CONFIG[k];
      // @ts-ignore
      animConfig[k] = v;
    }
    for (let key in animationConfigRef.current) {
      const k = key as keyof WithSpringConfig;
      const v = animationConfigRef.current[k];
      // @ts-ignore
      animConfig[k] = v;
    }
    return withSpring(toVal, DEFAULT_ANIMATION_CONFIG);
  }, [isActive]);

  return {
    isActive,
    onActiveAnim,
  };
}
