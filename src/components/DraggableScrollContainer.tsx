import React, { useMemo } from "react";
import { NativeScrollEvent, ScrollViewProps } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import Animated, { block, set } from "react-native-reanimated";
import {
  NestedScrollContainerProvider,
  useNestedScrollContainerContext,
} from "../context/nestedScrollContainerContext";

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

function DraggableScrollContainerInner(props: ScrollViewProps) {
  const {
    outerScrollOffset,
    containerRef,
    containerSize,
    scrollViewSize,
    scrollableRef,
    outerScrollEnabled,
  } = useNestedScrollContainerContext();

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

export function DraggableScrollContainer(props: ScrollViewProps) {
  return (
    <NestedScrollContainerProvider>
      <DraggableScrollContainerInner {...props} />
    </NestedScrollContainerProvider>
  );
}
