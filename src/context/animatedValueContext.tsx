import React, { useMemo, useEffect, useCallback, useContext } from "react";
import {
  useDerivedValue,
  useSharedValue,
  useValue,
} from "react-native-reanimated";
import { State as GestureState } from "react-native-gesture-handler";
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
  const containerSize = useSharedValue(0);
  const scrollViewSize = useSharedValue(0);

  const panGestureState = useSharedValue<GestureState>(
    GestureState.UNDETERMINED
  );
  const touchTranslate = useSharedValue(0);

  const isTouchActiveNative = useSharedValue(false);

  const hasMoved = useSharedValue(0);
  const disabled = useSharedValue(0);

  const horizontalAnim = useSharedValue(!!props.horizontal);

  const activeIndexAnim = useSharedValue(-1); // Index of hovering cell
  const spacerIndexAnim = useSharedValue(-1); // Index of hovered-over cell

  const activeCellSize = useSharedValue(0); // Height or width of acctive cell
  const activeCellOffset = useSharedValue(0); // Distance between active cell and edge of container

  const scrollOffset = useSharedValue(0);
  const scrollInit = useSharedValue(0);

  useDerivedValue(() => {
    if (activeIndexAnim.value < 0) {
      scrollInit.value = scrollOffset.value;
    }
  }, []);

  const placeholderOffset = useSharedValue(0);
  const placeholderScreenOffset = useDerivedValue(() => {
    return placeholderOffset.value - scrollOffset.value;
  }, []);

  const isDraggingCell = useDerivedValue(() => {
    return isTouchActiveNative.value && activeIndexAnim.value >= 0;
  }, []);

  const autoScrollDistance = useDerivedValue(() => {
    const scrollDiff = scrollOffset.value - scrollInit.value;
    return scrollDiff;
  }, []);

  const touchPositionDiff = useDerivedValue(() => {
    const extraTranslate = isTouchActiveNative.value
      ? autoScrollDistance.value
      : 0;
    return touchTranslate.value + extraTranslate;
  }, []);

  const touchPositionDiffConstrained = useDerivedValue(() => {
    const containerMinusActiveCell =
      containerSize.value - activeCellSize.value + scrollOffset.value;
    const constrained = Math.min(
      containerMinusActiveCell,
      Math.max(
        scrollOffset.value,
        touchPositionDiff.value + activeCellOffset.value
      )
    );
    // Only constrain the touch position while the finger is on the screen. This allows the active cell
    // to snap above/below the fold once let go, if the drag ends at the top/bottom of the screen.
    return isTouchActiveNative.value
      ? constrained - activeCellOffset.value
      : touchPositionDiff.value;
  }, []);

  const hoverAnim = useDerivedValue(() => {
    if (activeIndexAnim.value < 0) return 0;
    return props.dragItemOverflow
      ? touchPositionDiff.value
      : touchPositionDiffConstrained.value;
  }, []);

  const hoverOffset = useDerivedValue(() => {
    return hoverAnim.value + activeCellOffset.value;
  }, [hoverAnim, activeCellOffset]);

  useDerivedValue(() => {
    // Reset spacer index when we stop hovering
    const isHovering = activeIndexAnim.value >= 0;
    if (!isHovering && spacerIndexAnim.value >= 0) {
      spacerIndexAnim.value = -1;
    }
  }, []);

  // Note: this could use a refactor as it combines touch state + cell animation
  const resetTouchedCell = useCallback(() => {
    activeCellOffset.value = 0;
    hasMoved.value = 0;
  }, []);

  const value = useMemo(
    () => ({
      activeCellOffset,
      activeCellSize,
      activeIndexAnim,
      containerSize,
      disabled,
      horizontalAnim,
      hoverAnim,
      hoverOffset,
      isDraggingCell,
      isTouchActiveNative,
      panGestureState,
      placeholderOffset,
      resetTouchedCell,
      scrollOffset,
      scrollViewSize,
      spacerIndexAnim,
      touchPositionDiff,
      touchTranslate,
      autoScrollDistance,
    }),
    [
      activeCellOffset,
      activeCellSize,
      activeIndexAnim,
      containerSize,
      disabled,
      horizontalAnim,
      hoverAnim,
      hoverOffset,
      isDraggingCell,
      isTouchActiveNative,
      panGestureState,
      placeholderOffset,
      resetTouchedCell,
      scrollOffset,
      scrollViewSize,
      spacerIndexAnim,
      touchPositionDiff,
      touchTranslate,
      autoScrollDistance,
    ]
  );

  useEffect(() => {
    props.onAnimValInit?.(value);
  }, [value]);

  return value;
}
