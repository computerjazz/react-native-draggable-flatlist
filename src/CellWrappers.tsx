import React, { useCallback, useMemo } from "react";
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
  useValue,
  sub,
} from "react-native-reanimated";
import { springFill } from "./procs";
import { useSpring } from "./useSpring";
import { useNode } from "./utils";

type ScaleProps = {
  activeScale?: number;
  isDragging: Animated.Value<number>;
  isActive: boolean;
  children: React.ReactNode;
};

export const ScaleWrapper = ({
  activeScale = 1.1,
  isDragging,
  isActive,
  children,
}: ScaleProps) => {
  const { clock, state, config } = useSpring({
    config: { mass: 0.1, restDisplacementThreshold: 0.0001 },
  });

  useCode(
    () =>
      block([
        onChange(isDragging, [
          //@ts-ignore
          set(config.toValue, cond(isDragging, sub(activeScale, 1), 0)),
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
  isActive: boolean;
  children: React.ReactNode;
  elevation?: number;
  radius?: number;
  color?: string;
  opacity?: number;
};

export const ShadowWrapper = ({
  isActive,
  elevation = 10,
  color = "black",
  opacity = 0.25,
  radius = 5,
  children,
}: ShadowProps) => {
  const style = {
    elevation: isActive ? elevation : 0,
    shadowRadius: isActive ? radius : 0,
    shadowColor: isActive ? color : "transparent",
    shadowOpacity: isActive ? opacity : 0,
  };

  return <View style={style}>{children}</View>;
};

export const useCellWrapperHelpers = () => {
  const isDragging = useValue<number>(0);

  const onDragBegin = useCallback(() => {
    isDragging.setValue(1);
  }, [isDragging]);

  const onDragRelease = useCallback(() => {
    isDragging.setValue(0);
  }, [isDragging]);

  return useMemo(
    () => ({
      isDragging,
      onDragBegin,
      onDragRelease,
    }),
    [isDragging, onDragBegin, onDragRelease]
  );
};
