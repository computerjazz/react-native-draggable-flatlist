import React from "react";
import { StyleSheet } from "react-native";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import { useAnimatedValues } from "../context/animatedValueContext";
import { useDraggableFlatListContext } from "../context/draggableFlatListContext";
import { useRefs } from "../context/refContext";
import { RenderPlaceholder } from "../types";
import { typedMemo } from "../utils";

type Props<T> = {
  renderPlaceholder?: RenderPlaceholder<T>;
};

function PlaceholderItem<T>({ renderPlaceholder }: Props<T>) {
  const {
    activeCellSize,
    placeholderScreenOffset,
    spacerIndexAnim,
    horizontalAnim,
  } = useAnimatedValues();
  const { keyToIndexRef, propsRef } = useRefs<T>();

  const { activeKey } = useDraggableFlatListContext();

  const activeIndex = activeKey
    ? keyToIndexRef.current.get(activeKey)
    : undefined;
  const activeItem =
    activeIndex === undefined ? null : propsRef.current?.data[activeIndex];

  const animStyle = useAnimatedStyle(() => {
    const style: ReturnType<typeof useAnimatedStyle> = {
      opacity: spacerIndexAnim.value >= 0 ? 1 : 0,
      transform: [
        horizontalAnim.value
          ? { translateX: placeholderScreenOffset.value }
          : { translateY: placeholderScreenOffset.value },
      ],
    };
    if (horizontalAnim.value) {
      style.width = activeCellSize.value;
    } else {
      style.height = activeCellSize.value;
    }

    return style;
  }, [spacerIndexAnim, placeholderScreenOffset, horizontalAnim]);

  return (
    <Animated.View
      pointerEvents={activeKey ? "auto" : "none"}
      style={[StyleSheet.absoluteFill, animStyle]}
    >
      {!activeItem || activeIndex === undefined
        ? null
        : renderPlaceholder?.({ item: activeItem, index: activeIndex })}
    </Animated.View>
  );
}

export default typedMemo(PlaceholderItem);
