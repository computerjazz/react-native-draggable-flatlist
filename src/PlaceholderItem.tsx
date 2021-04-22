import React, { useCallback, useState } from "react";
import { StyleSheet } from "react-native";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useDerivedValue,
} from "react-native-reanimated";
import { useActiveKey, useStaticValues } from "./context";
import { RenderPlaceholder, typedMemo } from "./types";

type Props<T> = {
  renderPlaceholder?: RenderPlaceholder<T>;
};

function PlaceholderItem<T>({ renderPlaceholder }: Props<T>) {
  const {
    horizontalAnim,
    activeCellSize,
    keyToIndexRef,
    placeholderScreenOffset,
    propsRef,
    spacerIndexAnim,
  } = useStaticValues<T>();
  const { activeKey, isActiveVisible } = useActiveKey();

  const onPlaceholderIndexChange = useCallback(
    ({ placeholderIndex }: { placeholderIndex: number }) => {
      if (placeholderIndex !== -1) {
        propsRef.current?.onPlaceholderIndexChange?.(placeholderIndex);
      }
    },
    [propsRef]
  );

  useDerivedValue(() => {
    runOnJS(onPlaceholderIndexChange)({
      placeholderIndex: spacerIndexAnim.value,
    });
  });

  const style = useAnimatedStyle(() => {
    return horizontalAnim.value
      ? {
          width: activeCellSize.value,
          transform: [{ translateX: placeholderScreenOffset.value }],
        }
      : {
          height: activeCellSize.value,
          transform: [{ translateY: placeholderScreenOffset.value }],
        };
  });

  const activeIndex =
    isActiveVisible && activeKey
      ? keyToIndexRef.current.get(activeKey)
      : undefined;
  const activeItem =
    activeIndex === undefined ? null : propsRef.current?.data[activeIndex];

  return (
    <Animated.View
      pointerEvents={isActiveVisible ? "auto" : "none"}
      style={[StyleSheet.absoluteFill, style]}
    >
      {!activeItem || activeIndex === undefined
        ? null
        : renderPlaceholder?.({ item: activeItem, index: activeIndex })}
    </Animated.View>
  );
}

export default typedMemo(PlaceholderItem);
