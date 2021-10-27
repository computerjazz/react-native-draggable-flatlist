import React, { useCallback } from "react";
import { StyleSheet } from "react-native";
import Animated, {
  call,
  set,
  useCode,
  useValue,
  onChange,
  greaterThan,
  cond,
} from "react-native-reanimated";
import { useAnimatedValues } from "../context/animatedValueContext";
import { useDraggableFlatListContext } from "../context/draggableFlatlistContext";
import { useProps } from "../context/propsContext";
import { useRefs } from "../context/refContext";
import { useNode } from "../hooks/useNode";
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
  } = useAnimatedValues();
  const { keyToIndexRef, propsRef } = useRefs<T>();

  const { activeKey } = useDraggableFlatListContext();
  const { horizontal } = useProps();

  // for some reason using placeholderScreenOffset directly is buggy
  const translate = useValue(0);

  const onPlaceholderIndexChange = useCallback(
    (index: number) => {
      propsRef.current.onPlaceholderIndexChange?.(index);
    },
    [propsRef]
  );

  useCode(
    () =>
      onChange(
        spacerIndexAnim,
        call([spacerIndexAnim], ([i]) => {
          onPlaceholderIndexChange(i);
        })
      ),
    []
  );

  const translateKey = horizontal ? "translateX" : "translateY";
  const sizeKey = horizontal ? "width" : "height";
  const opacity = useNode(cond(greaterThan(spacerIndexAnim, -1), 1, 0));

  const activeIndex = activeKey
    ? keyToIndexRef.current.get(activeKey)
    : undefined;
  const activeItem =
    activeIndex === undefined ? null : propsRef.current?.data[activeIndex];

  const animStyle = {
    opacity,
    [sizeKey]: activeCellSize,
    transform: ([
      { [translateKey]: translate },
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
      <Animated.Code>
        {() => set(translate, placeholderScreenOffset)}
      </Animated.Code>
    </Animated.View>
  );
}

export default typedMemo(PlaceholderItem);
