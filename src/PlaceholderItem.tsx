import React from "react";
import { StyleSheet } from "react-native";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import { useStaticValues } from "./DraggableFlatListContext";
import { RenderPlaceholder } from "./types";

type Props<T> = {
  renderPlaceholder?: RenderPlaceholder<T>;
  activeKey: string | null;
};

function PlaceholderItem<T>({ renderPlaceholder, activeKey }: Props<T>) {
  const {
    horizontalAnim,
    activeCellSize,
    keyToIndexRef,
    placeholderScreenOffset,
    isHovering,
    propsRef,
  } = useStaticValues<T>();

  const style = useAnimatedStyle(() => {
    const opacity = isHovering.value ? 1 : 0;
    return horizontalAnim.value
      ? {
          opacity,
          width: activeCellSize.value,
          transform: [{ translateX: placeholderScreenOffset.value }],
        }
      : {
          opacity,
          height: activeCellSize.value,
          transform: [{ translateY: placeholderScreenOffset.value }],
        };
  });

  const activeIndex = activeKey
    ? keyToIndexRef.current.get(activeKey)
    : undefined;
  const activeItem =
    activeIndex === undefined ? null : propsRef.current.data[activeIndex];
  const children =
    activeItem &&
    activeIndex !== undefined &&
    renderPlaceholder?.({ item: activeItem, index: activeIndex });
  const isActive = !!children;
  return (
    <Animated.View
      pointerEvents={isActive ? "auto" : "none"}
      style={[StyleSheet.absoluteFill, style]}
    >
      {children}
    </Animated.View>
  );
}

export default PlaceholderItem;
