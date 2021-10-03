import React, {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ListRenderItem,
  FlatListProps,
  FlatList,
  findNodeHandle,
} from "react-native";
import {
  PanGestureHandler,
  State as GestureState,
  GestureEvent,
  PanGestureHandlerEventPayload,
} from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  scrollTo,
  useAnimatedGestureHandler,
  useAnimatedReaction,
  useAnimatedScrollHandler,
  useDerivedValue,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import CellRendererComponent from "./CellRendererComponent";
import { DEFAULT_PROPS, isWeb } from "../constants";
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
    isTouchActiveRef,
    keyToIndexRef,
    propsRef,
    scrollOffsetRef,
    animationConfigRef,
    scrollViewRef,
  } = useRefs<T>();
  const {
    activeCellOffset,
    activeCellSize,
    activeIndexAnim,
    containerSize,
    disabled,
    scrollOffset,
    scrollViewSize,
    spacerIndexAnim,
    horizontalAnim,
    placeholderOffset,
    touchTranslate,
  } = useAnimatedValues();

  const {
    dragHitSlop = DEFAULT_PROPS.dragHitSlop,
    scrollEnabled = DEFAULT_PROPS.scrollEnabled,
    activationDistance: activationDistanceProp = DEFAULT_PROPS.activationDistance,
  } = props;

  const [activeKey, setActiveKey] = useState<string | null>(null);

  const keyExtractor = useCallback(
    (item: T, index: number) => {
      if (propsRef.current.keyExtractor)
        return propsRef.current.keyExtractor(item, index);
      else
        throw new Error("You must provide a keyExtractor to DraggableFlatList");
    },
    [propsRef]
  );

  useLayoutEffect(() => {
    props.data.forEach((d, i) => {
      const key = keyExtractor(d, i);
      keyToIndexRef.current.set(key, i);
    });
  }, [props.data, keyExtractor, keyToIndexRef]);

  const resetHoverState = useCallback(() => {
    activeIndexAnim.value = -1;
    spacerIndexAnim.value = -1;
    touchTranslate.value = 0;
    setActiveKey(null);
  }, [activeIndexAnim, spacerIndexAnim, disabled]);

  // Reset hover state whenever keys/order changes
  const keys = useMemo(() => {
    const keyStr = props.data.reduce(
      (acc, cur, i) => acc + keyExtractor(cur, i),
      ""
    );

    return keyStr + Math.random();
  }, [props.data]);

  useMemo(() => {
    resetHoverState();
  }, [resetHoverState, keys]);

  const drag = useCallback(
    (activeKey: string) => {
      if (!isTouchActiveRef.current.js) return;
      const index = keyToIndexRef.current.get(activeKey);
      const cellData = cellDataRef.current.get(activeKey);
      if (cellData) {
        activeCellOffset.value =
          cellData.measurements.offset - scrollOffsetRef.current;
        activeCellSize.value = cellData.measurements.size;
      }

      const { onDragBegin } = propsRef.current;
      if (index !== undefined) {
        spacerIndexAnim.value = index;
        activeIndexAnim.value = index;
        setActiveKey(activeKey);
        onDragBegin?.(index);
      }
    },
    [
      isTouchActiveRef,
      keyToIndexRef,
      cellDataRef,
      propsRef,
      activeCellOffset,
      scrollOffsetRef,
      activeCellSize,
      spacerIndexAnim,
      activeIndexAnim,
    ]
  );

  const onContainerLayout = () => {
    const containerNode = containerRef.current;

    //@ts-ignore
    containerNode?.measure((_x, _y, w, h) => {
      containerSize.value = props.horizontal ? w : h;
    });
  };

  const onListContentSizeChange = (w: number, h: number) => {
    scrollViewSize.value = props.horizontal ? w : h;
    props.onContentSizeChange?.(w, h);
  };

  const onContainerTouchStart = () => {
    isTouchActiveRef.current.js = true;
    isTouchActiveRef.current.native.value = true;
    return false;
  };

  const onContainerTouchEnd = () => {
    isTouchActiveRef.current.js = false;
    isTouchActiveRef.current.native.value = false;
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
      return (
        <RowItem
          item={item}
          itemKey={keyExtractor(item, index)}
          renderItem={props.renderItem}
          drag={drag}
          extraData={props.extraData}
        />
      );
    },
    [props.renderItem, props.extraData, drag, keyExtractor]
  );

  const onRelease = useCallback(
    (index: number) => {
      propsRef.current.onRelease?.(index);
    },
    [propsRef]
  );

  const onDragEnd = useCallback(
    ({ from, to }: { from: number; to: number }) => {
      console.log("DRAG END!!!");
      const { onDragEnd, data } = propsRef.current;
      if (onDragEnd) {
        const newData = [...data];
        if (from !== to) {
          newData.splice(from, 1);
          newData.splice(to, 0, data[from]);
        }
        onDragEnd({ from, to, data: newData });
      }
    },
    [propsRef]
  );

  useAnimatedReaction(
    () => {
      return isTouchActiveRef.current.native.value;
    },
    (cur, prev) => {
      if (cur !== prev && !cur) {
        // Handle case where drag ends without moving.
        const hasMoved = !!touchTranslate.value;
        if (!hasMoved && activeKey) {
          runOnJS(onDragEnd)({
            from: activeIndexAnim.value,
            to: spacerIndexAnim.value,
          });
          runOnJS(resetHoverState)();
        }
      }
    },
    [isTouchActiveRef.current.native.value, resetHoverState, onDragEnd]
  );

  const onGestureEvent = useAnimatedGestureHandler<
    GestureEvent<PanGestureHandlerEventPayload>,
    { prevState: GestureState }
  >(
    {
      onActive: (evt) => {
        touchTranslate.value = horizontalAnim.value
          ? evt.translationX
          : evt.translationY;
      },
      onEnd: () => {
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
          }
        );
      },
    },
    []
  );

  const onScroll = useCallback(
    (scrollOffset) => {
      propsRef.current.onScrollOffsetChange?.(scrollOffset);
    },
    [propsRef]
  );

  const scrollHandler = useAnimatedScrollHandler(
    {
      onScroll: (evt) => {
        scrollOffset.value = horizontalAnim.value
          ? evt.contentOffset.x
          : evt.contentOffset.y;
      },
    },
    [horizontalAnim]
  );

  useAutoScroll();

  const someVal = useSharedValue(0);

  useDerivedValue(() => {
    scrollTo(scrollViewRef, 0, someVal.value, true);
  });

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
            scrollEventThrottle={1}
            simultaneousHandlers={props.simultaneousHandlers}
            removeClippedSubviews={false}
          />
        </Animated.View>
      </PanGestureHandler>
    </DraggableFlatListProvider>
  );
}

export default function DraggableFlatList<T>(props: DraggableFlatListProps<T>) {
  return (
    <PropsProvider {...props}>
      <AnimatedValueProvider>
        <RefProvider>
          <DraggableFlatListInner {...props} />
        </RefProvider>
      </AnimatedValueProvider>
    </PropsProvider>
  );
}

function useAnimatedRefDM() {
  const tag = useSharedValue(-1);
  const ref = useRef(null);

  if (!ref.current) {
    const fun = function (component) {
      "worklet";
      // enters when ref is set by attaching to a component
      if (component) {
        tag.value = findNodeHandle(component);
        fun.current = component;
        console.log("SET REF!!!", fun);
      }
      return tag.value;
    };

    Object.defineProperty(fun, "current", {
      value: null,
      writable: true,
      enumerable: false,
    });
    ref.current = fun;
  }

  return ref.current;
}
