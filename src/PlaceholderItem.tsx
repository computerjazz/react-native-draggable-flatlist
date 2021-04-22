import React from "react";
import { StyleSheet } from "react-native";
import Animated from "react-native-reanimated";
import { useActiveKey, useStaticValues, useProps } from "./context";
import { RenderPlaceholder } from "./types";
import { typedMemo } from "./utils";

type Props<T> = {
  renderPlaceholder?: RenderPlaceholder<T>;
};

function PlaceholderItem<T>({ renderPlaceholder }: Props<T>) {
  const {
    activeCellSize,
    keyToIndexRef,
    placeholderScreenOffset,
    propsRef,
  } = useStaticValues<T>();
  const { activeKey } = useActiveKey();
  const { horizontal } = useProps();

  const translateKey = horizontal ? "translateX" : "translateY";
  const sizeKey = horizontal ? "width" : "height";

  const activeIndex = activeKey
    ? keyToIndexRef.current.get(activeKey)
    : undefined;
  const activeItem =
    activeIndex === undefined ? null : propsRef.current?.data[activeIndex];

  const animStyle = {
    [sizeKey]: activeCellSize,
    transform: ([
      { [translateKey]: placeholderScreenOffset },
    ] as unknown) as Animated.AnimatedTransform,
  };

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
