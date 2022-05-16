import React, { useCallback, useLayoutEffect, useMemo, useState } from "react";
import { ListRenderItem, FlatListProps, LayoutChangeEvent } from "react-native";
import {
  FlatList,
  PanGestureHandler,
  State as GestureState,
  GestureEvent,
  PanGestureHandlerEventPayload,
  GestureEventPayload,
} from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedGestureHandler,
  useAnimatedReaction,
  useAnimatedScrollHandler,
  withSpring,
} from "react-native-reanimated";
import CellRendererComponent from "./CellRendererComponent";
import { DEFAULT_PROPS } from "../constants";
import PlaceholderItem from "./PlaceholderItem";
import RowItem from "./RowItem";
import { DraggableFlatListProps } from "../types";
import PropsProvider from "../context/propsContext";
import AnimatedValueProvider, {
  useAnimatedValues,
} from "../context/animatedValueContext";
import RefProvider, { useRefs } from "../context/refContext";
import DraggableFlatListProvider from "../context/draggableFlatListContext";
import { useAutoScroll } from "../hooks/useAutoScroll";
import { useIdentityRetainingCallback } from "../hooks/useIdentityRetainingCallback";
import ScrollOffsetListener from "./ScrollOffsetListener";

type RNGHFlatListProps<T> = Animated.AnimateProps<
  FlatListProps<T> & {
    ref: React.Ref<FlatList<T>>;
    simultaneousHandlers?: React.Ref<any> | React.Ref<any>[];
  }
>;

const AnimatedFlatList = (Animated.createAnimatedComponent(
  FlatList
) as unknown) as <T>(props: RNGHFlatListProps<T>) => React.ReactElement;

function DraggableFlatListInner<T>(props: DraggableFlatListProps<T>) {
  const {
    cellDataRef,
    containerRef,
    flatlistRef,
    keyToIndexRef,
    propsRef,
    animationConfigRef,
  } = useRefs<T>();
  const {
    activeCellOffset,
    activeCellSize,
    activeIndexAnim,
    containerSize,
    scrollOffset,
    scrollViewSize,
    spacerIndexAnim,
    horizontalAnim,
    placeholderOffset,
    touchTranslate,
    autoScrollDistance,
    panGestureState,
    isTouchActiveNative,
    disabled,
  } = useAnimatedValues();

  const {
    dragHitSlop = DEFAULT_PROPS.dragHitSlop,
    scrollEnabled = DEFAULT_PROPS.scrollEnabled,
    activationDistance: activationDistanceProp = DEFAULT_PROPS.activationDistance,
  } = props;

  const [activeKey, setActiveKey] = useState<string | null>(null);

  const keyExtractor = useIdentityRetainingCallback(
    (item: T, index: number) => {
      if (!props.keyExtractor) {
        throw new Error("You must provide a keyExtractor to DraggableFlatList");
      }
      return props.keyExtractor(item, index);
    }
  );

  useLayoutEffect(() => {
    props.data.forEach((d, i) => {
      const key = keyExtractor(d, i);
      keyToIndexRef.current.set(key, i);
    });
  }, [props.data, keyExtractor, keyToIndexRef]);

  // Reset hover state whenever data changes
  useMemo(() => {
    requestAnimationFrame(() => {
        activeIndexAnim.value = -1;
        spacerIndexAnim.value = -1;
        touchTranslate.value = 0;
        activeCellSize.value = -1;
        activeCellOffset.value = -1;
    })
  }, [props.data]);

  const drag = useIdentityRetainingCallback((activeKey: string) => {
    if (disabled.value) return
    const index = keyToIndexRef.current.get(activeKey);
    const cellData = cellDataRef.current.get(activeKey);
    if (cellData) {
      activeCellOffset.value = cellData.measurements.offset;
      activeCellSize.value = cellData.measurements.size;
    }

    const { onDragBegin } = propsRef.current;
    if (index !== undefined) {
      spacerIndexAnim.value = index;
      activeIndexAnim.value = index;
      setActiveKey(activeKey);
      onDragBegin?.(index);
    }
  });

  const onContainerLayout = ({
    nativeEvent: { layout },
  }: LayoutChangeEvent) => {
    const { width, height } = layout;
    containerSize.value = props.horizontal ? width : height;
  };

  const onListContentSizeChange = (w: number, h: number) => {
    scrollViewSize.value = props.horizontal ? w : h;
    props.onContentSizeChange?.(w, h);
  };

  const onContainerTouchStart = () => {
    isTouchActiveNative.value = true;
    return false;
  };

  const onContainerTouchEnd = () => {
    isTouchActiveNative.value = false;
  };

  let dynamicProps = {};
  if (activationDistanceProp) {
    const activeOffset = [-activationDistanceProp, activationDistanceProp];
    dynamicProps = props.horizontal
      ? { activeOffsetX: activeOffset }
      : { activeOffsetY: activeOffset };
  }

  const extraData = useMemo(
    () => ({
      activeKey,
      extraData: props.extraData,
    }),
    [activeKey, props.extraData]
  );

  const renderItem: ListRenderItem<T> = useCallback(
    ({ item, index }) => {
      const key = keyExtractor(item, index);

      if (index !== keyToIndexRef.current.get(key)) {
        keyToIndexRef.current.set(key, index);
      }

      return (
        <RowItem
          item={item}
          itemKey={key}
          renderItem={props.renderItem}
          drag={drag}
          extraData={props.extraData}
        />
      );
    },
    [props.renderItem, props.extraData, drag, keyExtractor]
  );

  const onRelease = useIdentityRetainingCallback((index: number) => {
    props.onRelease?.(index);
  });

  const onDragEnd = useIdentityRetainingCallback(
    ({ from, to }: { from: number; to: number }) => {
      const { onDragEnd, data } = props;
      if (onDragEnd) {
        const newData = [...data];
        if (from !== to) {
          newData.splice(from, 1);
          newData.splice(to, 0, data[from]);
        }
        onDragEnd({ from, to, data: newData });
        requestAnimationFrame(() => {
          setActiveKey(null);
        })
      }
    }
  );

  // Handle case where user ends drag without moving their finger.
  useAnimatedReaction(
    () => {
      return isTouchActiveNative.value;
    },
    (cur, prev) => {
      if (cur !== prev && !cur) {
        const hasMoved = !!touchTranslate.value;
        if (!hasMoved && activeIndexAnim.value >= 0 && !disabled.value) {
          runOnJS(onDragEnd)({
            from: activeIndexAnim.value,
            to: spacerIndexAnim.value,
          });
        }
      }
    },
    [isTouchActiveNative, onDragEnd]
  );

  const onGestureEvent = useAnimatedGestureHandler<
    GestureEvent<PanGestureHandlerEventPayload>,
    { prevState: GestureState }
  >(
    {
      onStart: (evt) => {
        if (disabled.value) return 
        panGestureState.value = evt.state;
      },
      onActive: (evt) => {
        if (disabled.value) return 
        panGestureState.value = evt.state;
        const translation = horizontalAnim.value
          ? evt.translationX
          : evt.translationY;
        touchTranslate.value = translation;
      },
      onEnd: (evt) => {
        // Set touch val to current translate val
        isTouchActiveNative.value = false;
        const translation = horizontalAnim.value
          ? evt.translationX
          : evt.translationY;

        touchTranslate.value = translation + autoScrollDistance.value;
        panGestureState.value = evt.state;

        // Only call onDragEnd if actually dragging a cell
        if (activeIndexAnim.value === -1 || disabled.value) return

        disabled.value = true;
        runOnJS(onRelease)(activeIndexAnim.value);
        const springTo = placeholderOffset.value - activeCellOffset.value;
        touchTranslate.value = withSpring(
          springTo,
          animationConfigRef.current,
          () => {
            runOnJS(onDragEnd)({
              from: activeIndexAnim.value,
              to: spacerIndexAnim.value,
            });
            disabled.value = false;
          }
        );
      },
    },
    []
  );

  const onScroll = useIdentityRetainingCallback(
    (scrollOffset: number) => {
      props.onScrollOffsetChange?.(scrollOffset);
    },
  );

  const scrollHandler = useAnimatedScrollHandler(
    {
      onScroll: (evt) => {
        scrollOffset.value = horizontalAnim.value
          ? evt.contentOffset.x
          : evt.contentOffset.y;
        runOnJS(onScroll)(scrollOffset.value);
      },
    },
    [horizontalAnim]
  );

  useAutoScroll();

  return (
    <DraggableFlatListProvider
      activeKey={activeKey}
      keyExtractor={keyExtractor}
      horizontal={!!props.horizontal}
    >
      <PanGestureHandler
        hitSlop={dragHitSlop}
        onGestureEvent={onGestureEvent}
        simultaneousHandlers={props.simultaneousHandlers}
        {...dynamicProps}
      >
        <Animated.View
          style={props.containerStyle}
          ref={containerRef}
          onLayout={onContainerLayout}
          onTouchEnd={onContainerTouchEnd}
          onStartShouldSetResponderCapture={onContainerTouchStart}
          //@ts-ignore
          onClick={onContainerTouchEnd}
        >
          {props.renderPlaceholder && (
            <PlaceholderItem renderPlaceholder={props.renderPlaceholder} />
          )}
          <AnimatedFlatList
            {...props}
            data={props.data}
            CellRendererComponent={CellRendererComponent}
            ref={flatlistRef}
            onContentSizeChange={onListContentSizeChange}
            scrollEnabled={!activeKey && scrollEnabled}
            renderItem={renderItem}
            extraData={extraData}
            keyExtractor={keyExtractor}
            onScroll={scrollHandler}
            scrollEventThrottle={16}
            simultaneousHandlers={props.simultaneousHandlers}
            removeClippedSubviews={false}
          />
          {!!props.onScrollOffsetChange && (
            <ScrollOffsetListener 
              onScrollOffsetChange={props.onScrollOffsetChange} 
              scrollOffset={scrollOffset}
              />
          )}
        </Animated.View>
      </PanGestureHandler>
    </DraggableFlatListProvider>
  );
}

function DraggableFlatList<T>(
  props: DraggableFlatListProps<T>,
  ref?: React.ForwardedRef<FlatList<T>> | null
) {
  return (
    <PropsProvider {...props}>
      <AnimatedValueProvider>
        <RefProvider flatListRef={ref}>
          <DraggableFlatListInner {...props} />
        </RefProvider>
      </AnimatedValueProvider>
    </PropsProvider>
  );
}

// Generic forwarded ref type assertion taken from:
// https://fettblog.eu/typescript-react-generic-forward-refs/#option-1%3A-type-assertion
export default React.forwardRef(DraggableFlatList) as <T>(
  props: DraggableFlatListProps<T> & { ref?: React.ForwardedRef<FlatList<T>> }
) => ReturnType<typeof DraggableFlatList>;
