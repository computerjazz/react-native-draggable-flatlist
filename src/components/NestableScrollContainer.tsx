import React, { useMemo } from "react";
import { NativeScrollEvent, ScrollViewProps } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import Animated, { block, set } from "react-native-reanimated";
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

  const onScroll = useMemo(
    () =>
      Animated.event([
        {
          nativeEvent: ({ contentOffset }: NativeScrollEvent) =>
            block([set(outerScrollOffset, contentOffset.y)]),
        },
      ]),
    []
  );

  return (
    <Animated.View
      ref={containerRef}
      onLayout={({ nativeEvent: { layout } }) => {
        containerSize.setValue(layout.height);
      }}
    >
      <AnimatedScrollView
        {...props}
        onContentSizeChange={(w, h) => {
          scrollViewSize.setValue(h);
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
