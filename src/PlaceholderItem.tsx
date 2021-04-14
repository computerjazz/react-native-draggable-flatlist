import React from "react";
import { StyleSheet } from "react-native";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import { useStaticValues } from "./DraggableFlatListContext";
import { RenderPlaceholder } from "./types";

type Props<T> = {
  renderPlaceholder?: RenderPlaceholder<T>;
  activeKey: string | null;
  data: T[];
};

function PlaceholderItem<T>({ renderPlaceholder, activeKey, data }: Props<T>) {
  const {
    horizontalAnim,
    activeCellSize,
    keyToIndexRef,
    placeholderOffset,
  } = useStaticValues();

  const style = useAnimatedStyle(() => {
    return horizontalAnim.value
      ? {
          width: activeCellSize.value,
          transform: [{ translateX: placeholderOffset.value }],
        }
      : {
          height: activeCellSize.value,
          transform: [{ translateY: placeholderOffset.value }],
        };
  });

  const activeIndex = activeKey
    ? keyToIndexRef.current.get(activeKey)
    : undefined;
  const activeItem = activeIndex === undefined ? null : data[activeIndex];
  const children =
    activeIndex !== undefined &&
    activeItem &&
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
