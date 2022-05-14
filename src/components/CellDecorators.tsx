import React from "react";
import { StyleSheet } from "react-native";
import Animated, {
  interpolate,
  useAnimatedStyle,
} from "react-native-reanimated";
import { useDraggableFlatListContext } from "../context/draggableFlatListContext";
export { useOnCellActiveAnimation } from "../hooks/useOnCellActiveAnimation";
import { useOnCellActiveAnimation } from "../hooks/useOnCellActiveAnimation";

type ScaleProps = {
  activeScale?: number;
  children: React.ReactNode;
};

export const ScaleDecorator = ({ activeScale = 1.1, children }: ScaleProps) => {
  const { isActive, onActiveAnim } = useOnCellActiveAnimation({
    animationConfig: { mass: 0.1, restDisplacementThreshold: 0.0001 },
  });
  const { horizontal } = useDraggableFlatListContext<any>();

  const style = useAnimatedStyle(() => {
    const animScale = interpolate(onActiveAnim.value, [0, 1], [1, activeScale]);
    const scale = isActive ? animScale : 1;
    return {
      transform: [{ scaleX: scale }, { scaleY: scale }],
    };
  }, [isActive]);

  return (
    <Animated.View style={[style, horizontal && styles.horizontal]}>
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
  const { horizontal } = useDraggableFlatListContext<any>();

  const style = useAnimatedStyle(() => {
    const shadowOpacity = onActiveAnim.value * opacity;
    return {
      elevation: isActive ? elevation : 0,
      shadowRadius: isActive ? radius : 0,
      shadowColor: isActive ? color : "transparent",
      shadowOpacity: isActive ? shadowOpacity : 0,
    };
  }, [isActive, onActiveAnim]);

  return (
    <Animated.View style={[style, horizontal && styles.horizontal]}>
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
  const { isActive, onActiveAnim } = useOnCellActiveAnimation();
  const { horizontal } = useDraggableFlatListContext<any>();
  const style = useAnimatedStyle(() => {
    const opacity = interpolate(onActiveAnim.value, [0, 1], [1, activeOpacity]);
    return {
      opacity: isActive ? opacity : 1,
    };
  }, [isActive]);

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
