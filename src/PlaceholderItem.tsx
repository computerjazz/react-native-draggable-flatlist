import React from "react";
import { StyleSheet, View } from "react-native";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import { useProps, useStaticValues } from "./DraggableFlatListContext";
import { RenderPlaceholder } from "./types";

type Props<T> = {
  renderPlaceholder?: RenderPlaceholder<T>;
  activeKey: string | null;
};

function PlaceholderItem<T>({ renderPlaceholder, activeKey }: Props<T>) {
  const {
    horizontalAnim,
    keyToIndexRef,
    placeholderScreenOffset,
    isHovering,
    propsRef,
    cellDataRef,
  } = useStaticValues<T>();
  const { horizontal } = useProps();

  const animStyle = useAnimatedStyle(() => {
    const opacity = isHovering.value ? 1 : 0;
    return horizontalAnim.value
      ? {
          opacity,
          transform: [{ translateX: placeholderScreenOffset.value }],
        }
      : {
          opacity,
          transform: [{ translateY: placeholderScreenOffset.value }],
        };
  });

  const activeCellData = activeKey && cellDataRef.current.get(activeKey);
  const activeCellSize = activeCellData?.measurements.size || 0;
  const cellStyle = horizontal
    ? { width: activeCellSize }
    : { height: activeCellSize };

  const activeIndex = activeKey
    ? keyToIndexRef.current.get(activeKey)
    : undefined;
  const activeItem =
    activeIndex === undefined ? null : propsRef.current?.data[activeIndex];
  const children =
    activeItem &&
    activeIndex !== undefined &&
    renderPlaceholder?.({ item: activeItem, index: activeIndex });
  const isActive = !!children;

  return (
    <Animated.View
      pointerEvents={isActive ? "auto" : "none"}
      style={[StyleSheet.absoluteFill, cellStyle, animStyle]}
    >
      {children}
    </Animated.View>
  );
}

export default PlaceholderItem;
