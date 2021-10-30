import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  StyleSheet,
  ListRenderItem,
  FlatListProps,
  LayoutChangeEvent,
} from "react-native";
import {
  PanGestureHandler,
  State as GestureState,
  FlatList,
  ScrollView,
  PanGestureHandlerGestureEvent,
} from "react-native-gesture-handler";
import Animated, {
  Extrapolate,
  interpolate,
  runOnJS,
  useAnimatedGestureHandler,
  useAnimatedReaction,
  useAnimatedRef,
  useAnimatedScrollHandler,
  useDerivedValue,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import CellRendererComponent from "./CellRendererComponent";
import { DEFAULT_PROPS } from "../constants";
import { DraggableFlatListProvider } from "../context";
import PlaceholderItem from "./PlaceholderItem";
import RowItem from "./RowItem";
import ScrollOffsetListener from "./ScrollOffsetListener";
import { DraggableFlatListProps } from "../types";
import { useAutoScroll } from "../hooks/useAutoScroll";
import { AutoScroller } from "./AutoScroller";

type RNGHFlatListProps<T> = Animated.AnimateProps<
  FlatListProps<T> & {
    ref: React.Ref<FlatList<T>>;
    simultaneousHandlers?: React.Ref<any> | React.Ref<any>[];
  }
>;

const AnimatedFlatList = (Animated.createAnimatedComponent(
  FlatList
) as unknown) as <T>(props: RNGHFlatListProps<T>) => React.ReactElement;

type CellData = {
  measurements: {
    size: number;
    offset: number;
  };
};

export default function DraggableFlatList<T>(props: DraggableFlatListProps<T>) {
  const propsRef = useRef(props);
  propsRef.current = props;

  const {
    dragItemOverflow = DEFAULT_PROPS.dragItemOverflow,
    dragHitSlop = DEFAULT_PROPS.dragHitSlop,
    animationConfig = DEFAULT_PROPS.animationConfig,
    scrollEnabled = DEFAULT_PROPS.scrollEnabled,
    activationDistance: activationDistanceProp = DEFAULT_PROPS.activationDistance,
  } = props;

  const animConfig = {
    ...DEFAULT_PROPS.animationConfig,
    ...animationConfig,
  };
  const animationConfigRef = useRef(animConfig);
  animationConfigRef.current = animConfig;

  const [activeKey, setActiveKey] = useState<string | null>(null);

  const containerRef = useRef<Animated.View>(null);
  const flatlistRef = useAnimatedRef<FlatList<T>>();
  const scrollViewRef = useAnimatedRef<ScrollView>();
  const panGestureHandlerRef = useRef<PanGestureHandler>(null);

  const containerSize = useSharedValue(0);

  const isPressedIn = useSharedValue(false);

  const hasMoved = useSharedValue(false);
  const disabled = useSharedValue(false);

  const horizontalAnim = useSharedValue(!!props.horizontal);
  horizontalAnim.value = !!props.horizontal;

  const activeIndexAnim = useSharedValue(-1); // Index of hovering cell
  const spacerIndexAnim = useSharedValue(-1); // Index of hovered-over cell

  const isHovering = useDerivedValue(() => {
    return activeIndexAnim.value > -1;
  }, []);

  const activeCellSize = useSharedValue(0); // Height or width of acctive cell
  const activeCellOffset = useSharedValue(0); // Distance between active cell and edge of container

  const scrollOffset = useSharedValue(0);
  const scrollViewSize = useSharedValue(0);
  const scrollInit = useSharedValue(0);
  const scrollTranslate = useDerivedValue(() => {
    return scrollInit.value - scrollOffset.value;
  }, []);

  const touchTranslate = useSharedValue(0);

  const hoverComponentTranslate = useDerivedValue(() => {
    return touchTranslate.value + scrollTranslate.value;
  }, []); // amount that the active component is translated from its starting point

  const hoverOffset = useDerivedValue(() => {
    const offset = hoverComponentTranslate.value + activeCellOffset.value;
    console.log(
      "offset!!",
      offset,
      hoverComponentTranslate.value,
      activeCellOffset.value
    );
    return offset;
  }, []);

  const placeholderOffset = useSharedValue(0);
  const placeholderScreenOffset = useDerivedValue(() => {
    return placeholderOffset.value - scrollOffset.value;
  }, []);

  const cellDataRef = useRef(new Map<string, CellData>());
  const keyToIndexRef = useRef(new Map<string, number>());

  const keyExtractor = useCallback((item: T, index: number) => {
    if (propsRef.current.keyExtractor)
      return propsRef.current.keyExtractor(item, index);
    else
      throw new Error("You must provide a keyExtractor to DraggableFlatList");
  }, []);

  useLayoutEffect(() => {
    props.data.forEach((d, i) => {
      const key = keyExtractor(d, i);
      keyToIndexRef.current.set(key, i);
    });
  }, [props.data, keyExtractor]);

  const drag = useCallback(
    (activeKey: string) => {
      const index = keyToIndexRef.current.get(activeKey);
      const cellData = cellDataRef.current.get(activeKey);
      if (cellData) {
        activeCellOffset.value = cellData.measurements.offset;
        activeCellSize.value = cellData.measurements.size;
        scrollInit.value = scrollOffset.value;
      }

      const { onDragBegin } = propsRef.current;
      if (index !== undefined) {
        // TODO: The order of operations between animated value state setting and setActiveKey callback
        // is very fickle. Rearranging the order causes a white flashe when the item becomes active.
        // Figure out a more robust way to sync JS and animated values.
        spacerIndexAnim.value = index;
        activeIndexAnim.value = index;
        isPressedIn.value = true;
        setActiveKey(activeKey);
        onDragBegin?.(index);
      }
    },
    [
      activeCellOffset,
      activeCellSize,
      activeIndexAnim,
      isPressedIn,
      scrollOffset,
      spacerIndexAnim,
    ]
  );

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (evt) => {
      scrollOffset.value = horizontalAnim.value
        ? evt.contentOffset.x
        : evt.contentOffset.y;
    },
  });

  const onContainerLayout = ({
    nativeEvent: { layout },
  }: LayoutChangeEvent) => {
    containerSize.value = props.horizontal ? layout.width : layout.height;
  };

  const onListContentSizeChange = (w: number, h: number) => {
    scrollViewSize.value = props.horizontal ? w : h;
    if (props.onContentSizeChange) props.onContentSizeChange(w, h);
  };

  const onContainerTouchEnd = () => {
    isPressedIn.value = false;
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

  const resetHoverState = useCallback(() => {
    setActiveKey(null);
  }, []);

  const onDragEnd = useCallback(
    ({ from, to }: { from: number; to: number }) => {
      const { onDragEnd, data } = propsRef.current;
      if (onDragEnd) {
        const newData = [...data];
        if (from !== to) {
          newData.splice(from, 1);
          newData.splice(to, 0, data[from]);
        }
        onDragEnd({ from, to, data: newData });
      }
      resetHoverState();
    },
    []
  );

  useAnimatedReaction(
    () => {
      return !isHovering.value && spacerIndexAnim.value !== -1;
    },
    (cur, prev) => {
      if (cur && prev !== cur && prev !== null) {
        spacerIndexAnim.value = -1;
      }
    },
    []
  );

  useAnimatedReaction(
    () => {
      return !isPressedIn.value && !hasMoved.value && isHovering.value;
    },
    (cur, prev) => {
      // The gesture handler will not activate if the user activates a cell and then releases without dragging.
      // This resets state in that case.
      if (cur && cur !== prev && prev !== null) {
        const from = activeIndexAnim.value;
        const to = spacerIndexAnim.value;
        disabled.value = false;
        hasMoved.value = false;
        runOnJS(onDragEnd)({ from, to });
        runOnJS(resetHoverState)();
      }
    },
    []
  );

  const onGestureEvent = useAnimatedGestureHandler<
    PanGestureHandlerGestureEvent,
    { state: GestureState; touchInit: number; activationDist: number }
  >(
    {
      onStart: (evt, ctx) => {
        if (disabled.value) return;
        hasMoved.value = true;
      },
      onActive: (evt, ctx) => {
        if (disabled.value) return;
        const rawVal = horizontalAnim.value
          ? evt.translationX
          : evt.translationY;
        touchTranslate.value = rawVal;

        console.log(
          `active!! trans: ${touchTranslate.value}  res: $}  rawVal ${rawVal}`
        );
      },
      onEnd: (evt, ctx) => {
        const from = activeIndexAnim.value;
        const to = spacerIndexAnim.value;

        console.log(`from ${from} to ${to}`);

        disabled.value = true;
        isPressedIn.value = false;
        const targetOffset = placeholderOffset.value - activeCellOffset.value;

        console.log(
          `tgt: ${targetOffset}, act fst: ${activeCellOffset.value}, ph: ${placeholderOffset.value}`
        );

        touchTranslate.value = withSpring(
          targetOffset,
          animationConfigRef.current,
          () => {
            runOnJS(onDragEnd)({ from, to });
            activeIndexAnim.value = -1;
            activeCellSize.value = 0;
            activeCellOffset.value = 0;

            scrollInit.value = 0;
            hasMoved.value = false;
            touchTranslate.value = 0;
            disabled.value = false;
          }
        );
      },
      onCancel: (evt, ctx) => {
        if (ctx.state !== evt.state) {
          ctx.state = evt.state;
          // TODO: copy onEnd?
        }
      },
      onFinish: (evt, ctx) => {
        if (ctx.state !== evt.state) {
          ctx.state = evt.state;
          // TODO: copy onEnd?
        }
      },
    },
    []
  );

  const contextParams = {
    activeCellOffset,
    activeCellSize,
    activeIndexAnim,
    activeKey,
    animationConfigRef,
    cellDataRef,
    containerSize,
    flatlistRef,
    horizontalAnim,
    hoverComponentTranslate,
    hoverOffset,
    isHovering,
    isPressedIn,
    keyExtractor,
    keyToIndexRef,
    placeholderOffset,
    placeholderScreenOffset,
    props,
    propsRef,
    scrollOffset,
    scrollViewRef,
    spacerIndexAnim,
    scrollViewSize,
  };

  return (
    <DraggableFlatListProvider {...contextParams}>
      <PanGestureHandler
        ref={panGestureHandlerRef}
        hitSlop={dragHitSlop}
        onGestureEvent={onGestureEvent}
        simultaneousHandlers={props.simultaneousHandlers}
        {...dynamicProps}
      >
        <Animated.View
          style={[styles.flex, props.containerStyle]}
          ref={containerRef}
          onLayout={onContainerLayout}
          onTouchEnd={onContainerTouchEnd}
        >
          {props.onScrollOffsetChange && (
            <ScrollOffsetListener
              scrollOffset={scrollOffset}
              onScrollOffsetChange={props.onScrollOffsetChange}
            />
          )}
          {!!props.renderPlaceholder && (
            <PlaceholderItem renderPlaceholder={props.renderPlaceholder} />
          )}
          <AnimatedFlatList
            {...props}
            CellRendererComponent={CellRendererComponent}
            ref={(ref) => {
              // It's not possible to set a custom scroll component on an RNGH flatlist, since RNGH overrides it:
              // https://github.com/software-mansion/react-native-gesture-handler/blob/master/src/components/GestureComponents.tsx#L78-L80
              // Calling useAnimatedRef as a function is not documented, but works:
              // https://github.com/software-mansion/react-native-reanimated/blob/master/src/reanimated2/hook/useAnimatedRef.ts

              flatlistRef(ref);
              // Grab ScrollView ref off of FlatList:
              // https://github.com/facebook/react-native/blob/main/Libraries/Lists/FlatList.js#L382-L393
              scrollViewRef(ref.getNativeScrollRef());
            }}
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
      <AutoScroller />
    </DraggableFlatListProvider>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
});
