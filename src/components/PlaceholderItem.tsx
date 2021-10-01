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
  useDerivedValue,
  useAnimatedStyle,
} from "react-native-reanimated";
import { useAnimatedValues } from "../context/animatedValueContext";
import { useDraggableFlatListContext } from "../context/draggableFlatListContext";
import { useProps } from "../context/propsContext";
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
  } = useAnimatedValues();
  const { keyToIndexRef, propsRef } = useRefs<T>();

  const { activeKey } = useDraggableFlatListContext();
  const { horizontal } = useProps();

  // // for some reason using placeholderScreenOffset directly is buggy
  // const translate = useValue(0);

  // const onPlaceholderIndexChange = useCallback(
  //   (index: number) => {
  //     propsRef.current.onPlaceholderIndexChange?.(index);
  //   },
  //   [propsRef]
  // );

  // useCode(
  //   () =>
  //     onChange(
  //       spacerIndexAnim,
  //       call([spacerIndexAnim], ([i]) => {
  //         onPlaceholderIndexChange(i);
  //       })
  //     ),
  //   []
  // );

  const activeIndex = activeKey
    ? keyToIndexRef.current.get(activeKey)
    : undefined;
  const activeItem =
    activeIndex === undefined ? null : propsRef.current?.data[activeIndex];

  const animStyle = useAnimatedStyle(() => {
    const translateKey = horizontal ? "translateX" : "translateY";
    const sizeKey = horizontal ? "width" : "height";
    return {
      opacity: spacerIndexAnim.value >= 0 ? 1 : 0,
      [sizeKey]: activeCellSize.value,
      transform: ([
        { [translateKey]: placeholderScreenOffset.value },
      ] as unknown) as Animated.AnimatedTransform,
    };
  }, [spacerIndexAnim, placeholderScreenOffset, horizontal]);

  return (
    <Animated.View
      pointerEvents={activeKey ? "auto" : "none"}
      style={[StyleSheet.absoluteFill, animStyle]}
    >
      {!activeItem || activeIndex === undefined
        ? null
        : renderPlaceholder?.({ item: activeItem, index: activeIndex })}
      {/* <Animated.Code>
        {() => set(translate, placeholderScreenOffset)}
      </Animated.Code> */}
    </Animated.View>
  );
}

export default typedMemo(PlaceholderItem);
