import React from "react";
import { ScrollViewProps } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import Animated, { useAnimatedScrollHandler } from "react-native-reanimated";
import {
  NestableScrollContainerProvider,
  useNestableScrollContainerContext,
} from "../context/nestableScrollContainerContext";

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

function NestableScrollContainerInner(props: ScrollViewProps) {
  const {
    outerScrollOffset,
    containerRef,
    containerSize,
    scrollViewSize,
    scrollableRef,
    outerScrollEnabled,
  } = useNestableScrollContainerContext();

  const onScroll = useAnimatedScrollHandler({
    onScroll: ({ contentOffset }) => {
      outerScrollOffset.value = contentOffset.y;
    },
  });

  // TODO: remove wrapper
  return (
    <Animated.View
      ref={containerRef}
      onLayout={({ nativeEvent: { layout } }) => {
        containerSize.value = layout.height;
      }}
    >
      <AnimatedScrollView
        {...props}
        onContentSizeChange={(w, h) => {
          scrollViewSize.value = h;
          props.onContentSizeChange?.(w, h);
        }}
        scrollEnabled={outerScrollEnabled}
        ref={scrollableRef}
        scrollEventThrottle={1}
        onScroll={onScroll}
      />
    </Animated.View>
  );
}

export function NestableScrollContainer(props: ScrollViewProps) {
  return (
    <NestableScrollContainerProvider>
      <NestableScrollContainerInner {...props} />
    </NestableScrollContainerProvider>
  );
}
