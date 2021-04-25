import React from "react";
import { View } from "react-native";
import Animated, {
  add,
  block,
  clockRunning,
  cond,
  onChange,
  set,
  startClock,
  stopClock,
  useCode,
  sub,
} from "react-native-reanimated";
import { springFill } from "../procs";
import { useSpring } from "../hooks/useSpring";
import { useNode } from "../hooks/useNode";
import { useAnimatedValues } from "../context/animatedValueContext";
import { useIsActive } from "../context/cellContext";

type ScaleProps = {
  activeScale?: number;
  children: React.ReactNode;
};

export const ScaleDecorator = ({ activeScale = 1.1, children }: ScaleProps) => {
  const { clock, state, config } = useSpring({
    config: { mass: 0.1, restDisplacementThreshold: 0.0001 },
  });

  const { isDraggingCell } = useAnimatedValues();
  const isActive = useIsActive();

  useCode(
    () =>
      block([
        onChange(isDraggingCell, [
          //@ts-ignore
          set(config.toValue, cond(isDraggingCell, sub(activeScale, 1), 0)),
          startClock(clock),
        ]),
        cond(clockRunning(clock), [
          springFill(clock, state, config),
          cond(state.finished, [
            stopClock(clock),
            set(state.finished, 0),
            set(state.time, 0),
            set(state.velocity, 0),
          ]),
        ]),
      ]),
    []
  );

  const animScale = useNode(add(state.position, 1));
  const scale = isActive ? animScale : 1;
  return (
    <Animated.View
      style={{ transform: [{ scaleX: scale }, { scaleY: scale }] }}
    >
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
  const isActive = useIsActive();
  const style = {
    elevation: isActive ? elevation : 0,
    shadowRadius: isActive ? radius : 0,
    shadowColor: isActive ? color : "transparent",
    shadowOpacity: isActive ? opacity : 0,
  };

  return <View style={style}>{children}</View>;
};
