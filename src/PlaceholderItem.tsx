import React, { useState } from "react";
import { StyleSheet } from "react-native";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useDerivedValue,
} from "react-native-reanimated";
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

  const [active, setActive] = useState(false);
  useDerivedValue(() => {
    // Tracking active in JS solves for the case where the placeholder renders before
    // animated values update, and does not expand to fill available space
    runOnJS(setActive)(isHovering.value);
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
    active && activeKey ? keyToIndexRef.current.get(activeKey) : undefined;
  const activeItem =
    activeIndex === undefined ? null : propsRef.current?.data[activeIndex];

  return (
    <Animated.View
      pointerEvents={active ? "auto" : "none"}
      style={[StyleSheet.absoluteFill, style]}
    >
      {!activeItem || activeIndex === undefined
        ? null
        : renderPlaceholder?.({ item: activeItem, index: activeIndex })}
    </Animated.View>
  );
}

export default PlaceholderItem;
