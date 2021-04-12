import React from "react";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import { useDraggableFlatListContext } from "./DraggableFlatListContext";

type Props = {
  component?: React.ReactNode | null;
  translate: Animated.SharedValue<number>;
  opacity: Animated.SharedValue<number>;
};

const HoverComponent = ({ component, translate, opacity }: Props) => {
  const { horizontalAnim } = useDraggableFlatListContext();

  const animStyle = useAnimatedStyle(() => {
    return {
      position: "absolute",
      left: horizontalAnim.value ? undefined : 0,
      right: horizontalAnim.value ? undefined : 0,
      top: horizontalAnim.value ? 0 : undefined,
      bottom: horizontalAnim.value ? 0 : undefined,
      opacity: opacity.value,
      transform: [
        horizontalAnim.value
          ? { translateX: translate.value }
          : { translateY: translate.value }
      ]
    };
  }, [opacity]);

  return (
    <Animated.View
      style={animStyle}
      pointerEvents={component ? "auto" : "none"}
    >
      {component}
    </Animated.View>
  );
};

export default React.memo(HoverComponent);
