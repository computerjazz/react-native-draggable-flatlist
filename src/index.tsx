import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { StyleSheet, ListRenderItem } from "react-native";
import {
  PanGestureHandler,
  State as GestureState,
  FlatList,
  PanGestureHandlerGestureEvent,
} from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedGestureHandler,
  useAnimatedRef,
  useAnimatedScrollHandler,
  useDerivedValue,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import CellRendererComponent from "./CellRendererComponent";
import { DEFAULT_PROPS } from "./constants";
import { DraggableFlatListProvider } from "./DraggableFlatListContext";
import HoverComponent from "./HoverComponent";
import PlaceholderItem from "./PlaceholderItem";
import RowItem from "./RowItem";
import { AnimatedFlatListType, DraggableFlatListProps } from "./types";
import { useAutoScroll } from "./useAutoScroll";

const AnimatedFlatList = Animated.createAnimatedComponent(
  FlatList
) as AnimatedFlatListType;

// Run callback on next paint:
// https://stackoverflow.com/questions/26556436/react-after-render-code
function onNextFrame(callback: () => void) {
  setTimeout(function () {
    requestAnimationFrame(callback);
  });
}

type ActiveItem = {
  component: React.ReactNode | null;
  key: string | null;
};

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
  } = props;

  const animConfig = {
    ...DEFAULT_PROPS.animationConfig,
    ...animationConfig,
  };
  const animationConfigRef = useRef(animConfig);
  animationConfigRef.current = animConfig;

  const [activeItem, setActiveItem] = useState<ActiveItem>({
    key: null,
    component: null,
  });
  const { key: activeKey } = activeItem;
  const activeKeyAnim = useSharedValue(activeKey);
  activeKeyAnim.value = activeKey;

  const hoverComponentRef = useRef(activeItem.component);
  hoverComponentRef.current = activeItem.component;

  const containerRef = useRef<Animated.View>(null);
  const flatlistRef = useAnimatedRef();
  const panGestureHandlerRef = useRef<PanGestureHandler>(null);

  const containerSize = useSharedValue(0);

  const touchInit = useSharedValue(0); // Position of initial touch
  const activationDistance = useSharedValue(0); // Distance finger travels from initial touch to when dragging begins
  const touchAbsolute = useSharedValue(0); // Finger position on screen, relative to container

  const isPressedIn = useRef({
    native: useSharedValue(false),
    js: false,
  });

  const hasMoved = useSharedValue(false);
  const disabled = useSharedValue(false);

  const horizontalAnim = useSharedValue(!!props.horizontal);

  const activeIndexAnim = useSharedValue(-1); // Index of hovering cell
  const spacerIndexAnim = useSharedValue(-1); // Index of hovered-over cell

  const isHovering = useDerivedValue(() => {
    return activeIndexAnim.value > -1;
  });

  const activeCellSize = useSharedValue(0); // Height or width of acctive cell
  const activeCellOffset = useSharedValue(0); // Distance between active cell and edge of container

  const scrollOffset = useSharedValue(0);
  const scrollViewSize = useSharedValue(0);

  const touchCellOffset = useDerivedValue(() => {
    // Distance between touch point and edge of cell
    return touchInit.value - activeCellOffset.value;
  });

  const snapInProgress = useSharedValue(false);
  const snapTo = useSharedValue(0);
  const hoverAnimUnconstrained = useDerivedValue(() => {
    return (
      touchAbsolute.value - activationDistance.value - touchCellOffset.value
    );
  });

  const hoverAnimConstrained = useDerivedValue(() => {
    const containerMinusCell = containerSize.value - activeCellSize.value;
    return Math.min(
      containerMinusCell,
      Math.max(0, hoverAnimUnconstrained.value)
    );
  });

  const hoverAnim = useDerivedValue(() => {
    const dragVal = dragItemOverflow
      ? hoverAnimConstrained.value
      : hoverAnimUnconstrained.value;
    return snapInProgress.value ? snapTo.value : dragVal;
  }, [dragItemOverflow]);
  const hoverOffset = useDerivedValue(
    () => hoverAnim.value + scrollOffset.value
  );
  const hoverComponentTranslate = useDerivedValue(() => hoverAnim.value);

  const placeholderScreenOffset = useSharedValue(0);
  const placeholderOffset = useDerivedValue(() => {
    return placeholderScreenOffset.value - scrollOffset.value;
  });

  const cellDataRef = useRef(new Map<string, CellData>());
  const keyToIndexRef = useRef(new Map<string, number>());

  useAutoScroll({
    scrollOffset,
    scrollViewSize,
    containerSize,
    hoverAnim,
    isHovering,
    activeCellSize,
    flatlistRef,
    horizontal: !!props.horizontal,
  });

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
    (hoverComponent: React.ReactNode, activeKey: string) => {
      if (hoverComponentRef.current !== null) {
        // We can't drag more than one row at a time
        // TODO: Put action on queue?
        if (propsRef.current.debug)
          console.log("## Can't set multiple active items");
      } else {
        isPressedIn.current.js = true;
        isPressedIn.current.native.value = true;
        const index = keyToIndexRef.current.get(activeKey);

        const cellData = cellDataRef.current.get(activeKey);
        if (cellData) {
          activeCellOffset.value =
            cellData.measurements.offset - scrollOffset.value;
          activeCellSize.value = cellData.measurements.size;
        }
        setActiveItem({
          key: activeKey,
          component: hoverComponent,
        });

        const { onDragBegin } = propsRef.current;
        if (index !== undefined) {
          spacerIndexAnim.value = index;
          activeIndexAnim.value = index;
          isPressedIn.current.native.value = true;
          onDragBegin?.(index);
        }
      }
    },
    []
  );

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (evt) => {
      scrollOffset.value = horizontalAnim.value
        ? evt.contentOffset.x
        : evt.contentOffset.y;
    },
  });

  const onContainerLayout = () => {
    if (containerRef.current) {
      //@ts-ignore
      containerRef.current.measure((_x, _y, w, h) => {
        containerSize.value = props.horizontal ? w : h;
      });
    }
  };

  const onListContentSizeChange = (w: number, h: number) => {
    scrollViewSize.value = props.horizontal ? w : h;
    if (props.onContentSizeChange) props.onContentSizeChange(w, h);
  };

  const onContainerTouchEnd = () => {
    isPressedIn.current.native.value = false;
  };

  let dynamicProps = {};
  if (props.activationDistance) {
    const activeOffset = [-props.activationDistance, props.activationDistance];
    dynamicProps = props.horizontal
      ? { activeOffsetX: activeOffset }
      : { activeOffsetY: activeOffset };
  }

  const extraData = useMemo(
    () => ({
      activeItem,
      extraData: props.extraData,
    }),
    [activeItem, props.extraData]
  );

  const renderItem: ListRenderItem<T> = useCallback(
    ({ item, index }) => {
      return (
        <RowItem
          item={item}
          itemKey={keyExtractor(item, index)}
          renderItem={props.renderItem}
          drag={drag}
        />
      );
    },
    [props.renderItem]
  );

  const onDragEnd = useCallback(
    ({ from, to }: { from: number; to: number }) => {
      // TODO: The order of operations between state setting, onDragEnd callback
      // and resetting the animated values is very fickle. Rearranging the order causes
      // white flashes when the list re-renders. Figure out a more robust way to sync JS and animated values.
      setActiveItem({ key: null, component: null });
      const { onDragEnd, data } = propsRef.current;

      if (onDragEnd) {
        let newData = [...data];
        if (from !== to) {
          newData.splice(from, 1);
          newData.splice(to, 0, data[from]);
        }
        onDragEnd({ from, to, data: newData });
      }
      activeIndexAnim.value = -1;
      activeCellSize.value = 0;
      activeCellOffset.value = 0;
      snapInProgress.value = false;
      disabled.value = false;
      activationDistance.value = 0;
      touchInit.value = 0;
      touchAbsolute.value = 0;
      spacerIndexAnim.value = 0;
    },
    []
  );

  const onGestureEvent = useAnimatedGestureHandler<
    PanGestureHandlerGestureEvent,
    { state: GestureState }
  >({
    onStart: (evt, ctx) => {
      if (disabled.value) return;
      if (ctx.state !== evt.state) {
        ctx.state = evt.state;
        touchAbsolute.value = horizontalAnim.value ? evt.x : evt.y;
        touchInit.value = horizontalAnim.value ? evt.x : evt.y;
        hasMoved.value = true;
      }
    },
    onActive: (evt, ctx) => {
      if (disabled.value) return;
      if (ctx.state !== evt.state) {
        ctx.state = evt.state;
        const reference = horizontalAnim.value ? evt.x : evt.y;
        activationDistance.value = reference - touchInit.value;
      }
      touchAbsolute.value = horizontalAnim.value ? evt.x : evt.y;
    },
    onEnd: (evt, ctx) => {
      if (ctx.state !== evt.state) {
        ctx.state = evt.state;
      }
      const from = activeIndexAnim.value;
      const to = spacerIndexAnim.value;
      disabled.value = true;
      snapTo.value = hoverAnim.value;
      snapInProgress.value = true;
      hasMoved.value = false;
      snapTo.value = withSpring(
        placeholderOffset.value,
        animationConfigRef.current,
        () => {
          console.log("DONE!");
          runOnJS(onDragEnd)({ from, to });
        }
      );
    },
    onCancel: (evt, ctx) => {
      if (ctx.state !== evt.state) {
        ctx.state = evt.state;
      }
    },
    onFinish: (evt, ctx) => {
      if (ctx.state !== evt.state) {
        ctx.state = evt.state;
      }
    },
  });

  return (
    <DraggableFlatListProvider
      horizontalAnim={horizontalAnim}
      activeIndexAnim={activeIndexAnim}
      spacerIndexAnim={spacerIndexAnim}
      activeKeyAnim={activeKeyAnim}
      cellDataRef={cellDataRef}
      keyToIndexRef={keyToIndexRef}
      hoverOffset={hoverOffset}
      activeCellSize={activeCellSize}
      activeCellOffset={activeCellOffset}
      scrollOffset={scrollOffset}
      isHovering={isHovering}
      placeholderOffset={placeholderOffset}
      animationConfigRef={animationConfigRef}
      keyExtractor={keyExtractor}
      flatlistRef={flatlistRef}
      activeKey={activeKey}
      props={props}
    >
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
          <PlaceholderItem
            activeKey={activeKey}
            renderPlaceholder={props.renderPlaceholder}
          />
          <AnimatedFlatList
            {...props}
            CellRendererComponent={CellRendererComponent}
            ref={flatlistRef}
            onContentSizeChange={onListContentSizeChange}
            scrollEnabled={!activeItem.component && scrollEnabled}
            renderItem={renderItem}
            extraData={extraData}
            keyExtractor={keyExtractor}
            onScroll={scrollHandler}
            scrollEventThrottle={1}
            simultaneousHandlers={props.simultaneousHandlers}
          />
          <HoverComponent
            component={activeItem.component}
            translate={hoverComponentTranslate}
          />
        </Animated.View>
      </PanGestureHandler>
    </DraggableFlatListProvider>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
});
