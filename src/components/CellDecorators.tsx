import React from "react";
import { StyleSheet } from "react-native";
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedStyle,
} from "react-native-reanimated";
import { useProps } from "../context/propsContext";
import { useOnCellActiveAnimation } from "../hooks/useOnCellActiveAnimation";
export { useOnCellActiveAnimation } from "../hooks/useOnCellActiveAnimation";

type ScaleProps = {
  activeScale?: number;
  children: React.ReactNode;
};

export const ScaleDecorator = ({ activeScale = 1.1, children }: ScaleProps) => {
  const { horizontal } = useProps();
  const { onActiveAnim } = useOnCellActiveAnimation({
    animationConfig: { mass: 0.1, restDisplacementThreshold: 0.0001 },
  });

  const style = useAnimatedStyle(() => {
    const scale = interpolate(
      onActiveAnim.value,
      [0, 1],
      [1, activeScale],
      Extrapolate.CLAMP
    );
    return {
      transform: [{ scaleX: scale }, { scaleY: scale }],
    };
  }, []);

  return (
    <Animated.View style={[horizontal && styles.horizontal, style]}>
      {children}
    </Animated.View>
  );
};

type ShadowProps = {
  children: React.ReactNode;
  elevation?: number;
  radius?: number;
  color?: string;
  opacity?: number;
};

export const ShadowDecorator = ({
  elevation = 10,
  color = "black",
  opacity = 0.25,
  radius = 5,
  children,
}: ShadowProps) => {
  const { isActive, onActiveAnim } = useOnCellActiveAnimation();
  const { horizontal } = useProps();

  const animStyle = useAnimatedStyle(() => {
    return {
      shadowOpacity: onActiveAnim.value * opacity,
    };
  }, [onActiveAnim, opacity]);

  const style = {
    elevation: isActive ? elevation : 0,
    shadowRadius: isActive ? radius : 0,
    shadowColor: isActive ? color : "transparent",
  };

  return (
    <Animated.View style={[animStyle, style, horizontal && styles.horizontal]}>
      {children}
    </Animated.View>
  );
};

type OpacityProps = {
  activeOpacity?: number;
  children: React.ReactNode;
};

export const OpacityDecorator = ({
  activeOpacity = 0.25,
  children,
}: OpacityProps) => {
  const { onActiveAnim } = useOnCellActiveAnimation();
  const { horizontal } = useProps();

  const style = useAnimatedStyle(() => {
    return {
      opacity: interpolate(
        onActiveAnim.value,
        [0, 1],
        [1, activeOpacity],
        Extrapolate.CLAMP
      ),
    };
  }, []);

  return (
    <Animated.View style={[style, horizontal && styles.horizontal]}>
      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  horizontal: {
    flexDirection: "row",
    flex: 1,
  },
});
