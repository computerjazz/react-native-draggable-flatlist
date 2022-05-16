import React from "react";
import { ScrollViewProps } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import Animated, { useAnimatedScrollHandler } from "react-native-reanimated";
import {
  NestableScrollContainerProvider,
  useSafeNestableScrollContainerContext,
} from "../context/nestableScrollContainerContext";

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

function NestableScrollContainerInner(props: ScrollViewProps) {
  const {
    outerScrollOffset,
    containerSize,
    scrollViewSize,
    scrollableRef,
    outerScrollEnabled,
  } = useSafeNestableScrollContainerContext();

  const onScroll = useAnimatedScrollHandler({
    onScroll: ({ contentOffset }) => {
      outerScrollOffset.value = contentOffset.y;
    },
  });

  return (
      <AnimatedScrollView
        {...props}
        onLayout={({ nativeEvent: { layout }}) => {
          containerSize.value = layout.height;
        }}
        onContentSizeChange={(w, h) => {
          scrollViewSize.value = h;
          props.onContentSizeChange?.(w, h);
        }}
        scrollEnabled={outerScrollEnabled}
        ref={scrollableRef}
        scrollEventThrottle={1}
        onScroll={onScroll}
      />
  );
}

export function NestableScrollContainer(props: ScrollViewProps) {
  return (
    <NestableScrollContainerProvider>
      <NestableScrollContainerInner {...props} />
    </NestableScrollContainerProvider>
  );
}
