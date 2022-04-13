import React, { useContext, useEffect, useMemo } from "react";
import Animated, {
  add,
  and,
  block,
  greaterThan,
  max,
  min,
  onChange,
  set,
  sub,
  useCode,
  useValue,
} from "react-native-reanimated";
import { State as GestureState } from "react-native-gesture-handler";
import { useNode } from "../hooks/useNode";
import { useProps } from "./propsContext";
import { DEFAULT_PROPS } from "../constants";

if (!useValue) {
  throw new Error("Incompatible Reanimated version (useValue not found)");
}

const AnimatedValueContext = React.createContext<
  ReturnType<typeof useSetupAnimatedValues> | undefined
>(undefined);

export default function AnimatedValueProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const value = useSetupAnimatedValues();
  return (
    <AnimatedValueContext.Provider value={value}>
      {children}
    </AnimatedValueContext.Provider>
  );
}

export function useAnimatedValues() {
  const value = useContext(AnimatedValueContext);
  if (!value) {
    throw new Error(
      "useAnimatedValues must be called from within AnimatedValueProvider!"
    );
  }
  return value;
}

function useSetupAnimatedValues<T>() {
  const props = useProps<T>();
  const containerSize = useValue<number>(0);

  const touchInit = useValue<number>(0); // Position of initial touch
  const activationDistance = useValue<number>(0); // Distance finger travels from initial touch to when dragging begins
  const touchAbsolute = useValue<number>(0); // Finger position on screen, relative to container
  const panGestureState = useValue<GestureState>(GestureState.UNDETERMINED);

  const isTouchActiveNative = useValue<number>(0);

  const disabled = useValue<number>(0);

  const horizontalAnim = useValue(props.horizontal ? 1 : 0);

  const activeIndexAnim = useValue<number>(-1); // Index of hovering cell
  const spacerIndexAnim = useValue<number>(-1); // Index of hovered-over cell

  const activeCellSize = useValue<number>(0); // Height or width of acctive cell
  const activeCellOffset = useValue<number>(0); // Distance between active cell and edge of container

  const isDraggingCell = useNode(
    and(isTouchActiveNative, greaterThan(activeIndexAnim, -1))
  );

  const scrollOffset = useValue<number>(0);

  const outerScrollOffset =
    props.outerScrollOffset || DEFAULT_PROPS.outerScrollOffset;
  const outerScrollOffsetSnapshot = useValue<number>(0); // Amount any outer scrollview has scrolled since last gesture event.
  const outerScrollOffsetDiff = sub(
    outerScrollOffset,
    outerScrollOffsetSnapshot
  );

  const scrollViewSize = useValue<number>(0);

  const touchCellOffset = useNode(sub(touchInit, activeCellOffset));

  const hoverAnimUnconstrained = useNode(
    add(
      outerScrollOffsetDiff,
      sub(sub(touchAbsolute, activationDistance), touchCellOffset)
    )
  );

  const hoverAnimConstrained = useNode(
    min(sub(containerSize, activeCellSize), max(0, hoverAnimUnconstrained))
  );

  const hoverAnim = props.dragItemOverflow
    ? hoverAnimUnconstrained
    : hoverAnimConstrained;

  const hoverOffset = useNode(add(hoverAnim, scrollOffset));

  useCode(
    () =>
      onChange(
        touchAbsolute,
        // If the list is being used in "nested" mode (ie. there's an outer scrollview that contains the list)
        // then we need a way to track the amound the outer list has auto-scrolled during the current touch position.
        set(outerScrollOffsetSnapshot, outerScrollOffset)
      ),
    [outerScrollOffset]
  );

  const placeholderOffset = useValue<number>(0);

  // Note: this could use a refactor as it combines touch state + cell animation
  const resetTouchedCell = useNode(
    block([
      set(touchAbsolute, 0),
      set(touchInit, 0),
      set(activeCellOffset, 0),
      set(activationDistance, 0),
    ])
  );

  const value = useMemo(
    () => ({
      activationDistance,
      activeCellOffset,
      activeCellSize,
      activeIndexAnim,
      containerSize,
      disabled,
      horizontalAnim,
      hoverAnim,
      hoverAnimConstrained,
      hoverAnimUnconstrained,
      hoverOffset,
      isDraggingCell,
      isTouchActiveNative,
      panGestureState,
      placeholderOffset,
      resetTouchedCell,
      scrollOffset,
      scrollViewSize,
      spacerIndexAnim,
      touchAbsolute,
      touchCellOffset,
      touchInit,
    }),
    [
      activationDistance,
      activeCellOffset,
      activeCellSize,
      activeIndexAnim,
      containerSize,
      disabled,
      horizontalAnim,
      hoverAnim,
      hoverAnimConstrained,
      hoverAnimUnconstrained,
      hoverOffset,
      isDraggingCell,
      isTouchActiveNative,
      panGestureState,
      placeholderOffset,
      resetTouchedCell,
      scrollOffset,
      scrollViewSize,
      spacerIndexAnim,
      touchAbsolute,
      touchCellOffset,
      touchInit,
    ]
  );

  useEffect(() => {
    props.onAnimValInit?.(value);
  }, [value]);

  return value;
}
