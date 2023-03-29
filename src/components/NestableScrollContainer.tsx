import React from "react";

import { LayoutChangeEvent, ScrollViewProps } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedScrollHandler,
} from "react-native-reanimated";

import {
  NestableScrollContainerProvider,
  useSafeNestableScrollContainerContext,
} from "../context/nestableScrollContainerContext";
import { useStableCallback } from "../hooks/useStableCallback";

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

type NestableScrollContainerInnerProps = {
  onScrollOffsetChange?: (scrollOffset: number) => void;
} & Omit<ScrollViewProps, "onScroll">;

function NestableScrollContainerInner(
  props: NestableScrollContainerInnerProps
) {
  const {
    outerScrollOffset,
    containerSize,
    scrollViewSize,
    scrollableRef,
    outerScrollEnabled,
  } = useSafeNestableScrollContainerContext();

  const onScroll = useStableCallback((scrollOffset: number) => {
    props.onScrollOffsetChange?.(scrollOffset);
  });

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      outerScrollOffset.value = event.contentOffset.y;
      runOnJS(onScroll)(event.contentOffset.y);
    },
  });

  const onLayout = useStableCallback((event: LayoutChangeEvent) => {
    const {
      nativeEvent: { layout },
    } = event;
    containerSize.value = layout.height;
  });

  const onContentSizeChange = useStableCallback((w: number, h: number) => {
    scrollViewSize.value = h;
    props.onContentSizeChange?.(w, h);
  });

  return (
    <AnimatedScrollView
      {...props}
      onLayout={onLayout}
      onContentSizeChange={onContentSizeChange}
      scrollEnabled={outerScrollEnabled}
      ref={scrollableRef}
      scrollEventThrottle={1}
      onScroll={scrollHandler}
    />
  );
}

export const NestableScrollContainer = React.forwardRef(
  (
    props: NestableScrollContainerInnerProps,
    forwardedRef?: React.ForwardedRef<ScrollView>
  ) => {
    return (
      <NestableScrollContainerProvider
        forwardedRef={
          (forwardedRef as React.MutableRefObject<ScrollView>) || undefined
        }
      >
        <NestableScrollContainerInner {...props} />
      </NestableScrollContainerProvider>
    );
  }
);
