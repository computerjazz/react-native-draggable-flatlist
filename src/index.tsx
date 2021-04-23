import React, {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ListRenderItem, FlatListProps, NativeScrollEvent } from "react-native";
import {
  PanGestureHandler,
  State as GestureState,
  FlatList,
  PanGestureHandlerGestureEvent,
  PanGestureHandlerStateChangeEvent,
} from "react-native-gesture-handler";
import Animated, {
  add,
  and,
  block,
  call,
  cond,
  eq,
  event,
  greaterThan,
  max,
  min,
  neq,
  not,
  onChange,
  or,
  set,
  sub,
  useAnimatedRef,
  useValue,
} from "react-native-reanimated";
import CellRendererComponent from "./CellRendererComponent";
import { DEFAULT_PROPS } from "./constants";
import { DraggableFlatListProvider } from "./context";
import PlaceholderItem from "./PlaceholderItem";
import RowItem from "./RowItem";
import ScrollOffsetListener from "./ScrollOffsetListener";
import { DraggableFlatListProps } from "./types";
import { useAutoScroll } from "./useAutoScroll";
import { useNode } from "./utils";

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
  } as Animated.SpringConfig;
  const animationConfigRef = useRef(animConfig);
  animationConfigRef.current = animConfig;

  const [activeKey, setActiveKey] = useState<string | null>(null);

  const containerRef = useRef<Animated.View>(null);
  const flatlistRef = useAnimatedRef<FlatList<T>>();
  const panGestureHandlerRef = useRef<PanGestureHandler>(null);

  const containerSize = useValue<number>(0);

  const touchInit = useValue<number>(0); // Position of initial touch
  const activationDistance = useValue<number>(0); // Distance finger travels from initial touch to when dragging begins
  const touchAbsolute = useValue<number>(0); // Finger position on screen, relative to container
  const panGestureState = useValue<GestureState>(GestureState.UNDETERMINED);

  const isTouchActiveNative = useValue<number>(0);

  const isTouchActive = useRef({
    native: isTouchActiveNative,
    js: false,
  });

  const hasMoved = useValue<number>(0);
  const disabled = useValue<number>(0);

  const horizontalAnim = useValue(props.horizontal ? 1 : 0);

  const activeIndexAnim = useValue<number>(-1); // Index of hovering cell
  const spacerIndexAnim = useValue<number>(-1); // Index of hovered-over cell

  const activeCellSize = useValue<number>(0); // Height or width of acctive cell
  const activeCellOffset = useValue<number>(0); // Distance between active cell and edge of container

  const isHovering = useNode(greaterThan(activeIndexAnim, -1));
  const isDraggingCell = useNode(and(isTouchActiveNative, isHovering));

  const scrollOffset = useValue<number>(0);
  const scrollOffsetRef = useRef(0);

  const scrollViewSize = useValue<number>(0);

  const touchCellOffset = useNode(sub(touchInit, activeCellOffset));

  const hoverAnimUnconstrained = useNode(
    sub(sub(touchAbsolute, activationDistance), touchCellOffset)
  );

  const hoverAnimConstrained = useNode(
    min(sub(containerSize, activeCellSize), max(0, hoverAnimUnconstrained))
  );

  const hoverAnim = dragItemOverflow
    ? hoverAnimUnconstrained
    : hoverAnimConstrained;

  const hoverOffset = useNode(add(hoverAnim, scrollOffset));

  const placeholderOffset = useValue<number>(0);
  const placeholderScreenOffset = useNode(sub(placeholderOffset, scrollOffset));

  const cellDataRef = useRef(new Map<string, CellData>());
  const keyToIndexRef = useRef(new Map<string, number>());

  const keyExtractor = useCallback((item: T, index: number) => {
    if (propsRef.current.keyExtractor)
      return propsRef.current.keyExtractor(item, index);
    else
      throw new Error("You must provide a keyExtractor to DraggableFlatList");
  }, []);

  // Note: this could use a refactor as it combines touch state + cell animation
  const resetTouchedCell = useNode(
    block([
      set(touchAbsolute, 0),
      set(touchInit, 0),
      set(activeCellOffset, 0),
      set(activationDistance, 0),
      set(hasMoved, 0),
    ])
  );

  useLayoutEffect(() => {
    props.data.forEach((d, i) => {
      const key = keyExtractor(d, i);
      keyToIndexRef.current.set(key, i);
    });
  }, [props.data, keyExtractor]);

  const drag = useCallback(
    (activeKey: string) => {
      if (!isTouchActive.current.js) return;
      const index = keyToIndexRef.current.get(activeKey);
      const cellData = cellDataRef.current.get(activeKey);
      if (cellData) {
        activeCellOffset.setValue(
          cellData.measurements.offset - scrollOffsetRef.current
        );
        activeCellSize.setValue(cellData.measurements.size);
      }

      const { onDragBegin } = propsRef.current;
      if (index !== undefined) {
        spacerIndexAnim.setValue(index);
        activeIndexAnim.setValue(index);
        setActiveKey(activeKey);
        onDragBegin?.(index);
      }
    },
    [activeCellSize, activeCellOffset, activeIndexAnim, spacerIndexAnim]
  );

  const autoScrollNode = useAutoScroll({
    scrollOffset,
    scrollViewSize,
    containerSize,
    hoverAnim,
    isDraggingCell,
    activeCellSize,
    flatlistRef,
    panGestureState,
  });

  const onContainerLayout = () => {
    if (containerRef.current) {
      //@ts-ignore
      containerRef.current.measure((_x, _y, w, h) => {
        containerSize.setValue(props.horizontal ? w : h);
      });
    }
  };

  const onListContentSizeChange = (w: number, h: number) => {
    scrollViewSize.setValue(props.horizontal ? w : h);
    if (props.onContentSizeChange) props.onContentSizeChange(w, h);
  };

  const onContainerTouchStart = () => {
    isTouchActive.current.js = true;
    isTouchActive.current.native.setValue(1);
  };

  const onContainerTouchEnd = () => {
    isTouchActive.current.js = false;
    isTouchActive.current.native.setValue(0);
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
    activeIndexAnim.setValue(-1);
    spacerIndexAnim.setValue(-1);
    touchAbsolute.setValue(0);
    disabled.setValue(0);
  }, [activeIndexAnim, spacerIndexAnim, touchAbsolute, disabled]);

  const onRelease = ([index]: readonly number[]) => {
    props.onRelease?.(index);
  };

  const onDragEnd = useCallback(
    ([from, to]: readonly number[]) => {
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
    [resetHoverState]
  );

  const onGestureRelease = useNode(
    cond(
      isHovering,
      [
        set(disabled, 1),
        set(isTouchActiveNative, 0),
        call([activeIndexAnim], onRelease),
        cond(not(hasMoved), call([activeIndexAnim], resetHoverState)),
      ],
      [call([activeIndexAnim], resetHoverState), resetTouchedCell]
    )
  );

  const onPanStateChange = event([
    {
      nativeEvent: ({
        state,
        x,
        y,
      }: PanGestureHandlerStateChangeEvent["nativeEvent"]) =>
        cond(and(neq(state, panGestureState), not(disabled)), [
          cond(
            or(
              eq(state, GestureState.BEGAN), // Called on press in on Android, NOT on ios!
              // GestureState.BEGAN may be skipped on fast swipes
              and(
                eq(state, GestureState.ACTIVE),
                neq(panGestureState, GestureState.BEGAN)
              )
            ),
            [
              set(touchAbsolute, props.horizontal ? x : y),
              set(touchInit, touchAbsolute),
            ]
          ),
          cond(eq(state, GestureState.ACTIVE), [
            set(activationDistance, sub(props.horizontal ? x : y, touchInit)),
            set(touchAbsolute, props.horizontal ? x : y),
          ]),
          cond(neq(panGestureState, state), set(panGestureState, state)),
          cond(
            or(
              eq(state, GestureState.END),
              eq(state, GestureState.CANCELLED),
              eq(state, GestureState.FAILED)
            ),
            onGestureRelease
          ),
        ]),
    },
  ]);

  const onPanGestureEvent = event([
    {
      nativeEvent: ({ x, y }: PanGestureHandlerGestureEvent["nativeEvent"]) =>
        cond(
          and(
            isHovering,
            eq(panGestureState, GestureState.ACTIVE),
            not(disabled)
          ),
          [
            cond(not(hasMoved), set(hasMoved, 1)),
            set(touchAbsolute, props.horizontal ? x : y),
          ]
        ),
    },
  ]);

  const scrollHandler = event([
    {
      nativeEvent: ({ contentOffset }: NativeScrollEvent) =>
        block([
          set(
            scrollOffset,
            props.horizontal ? contentOffset.x : contentOffset.y
          ),
          autoScrollNode,
        ]),
    },
  ]);

  return (
    <DraggableFlatListProvider
      activeCellOffset={activeCellOffset}
      activeCellSize={activeCellSize}
      activeIndexAnim={activeIndexAnim}
      activeKey={activeKey}
      animationConfigRef={animationConfigRef}
      cellDataRef={cellDataRef}
      flatlistRef={flatlistRef}
      hasMoved={hasMoved}
      horizontalAnim={horizontalAnim}
      hoverOffset={hoverOffset}
      isHovering={isHovering}
      isDraggingCell={isDraggingCell}
      keyExtractor={keyExtractor}
      keyToIndexRef={keyToIndexRef}
      onDragEnd={onDragEnd}
      placeholderOffset={placeholderOffset}
      placeholderScreenOffset={placeholderScreenOffset}
      props={props}
      resetTouchedCell={resetTouchedCell}
      scrollOffset={scrollOffset}
      spacerIndexAnim={spacerIndexAnim}
    >
      <PanGestureHandler
        ref={panGestureHandlerRef}
        hitSlop={dragHitSlop}
        onHandlerStateChange={onPanStateChange}
        onGestureEvent={onPanGestureEvent}
        simultaneousHandlers={props.simultaneousHandlers}
        {...dynamicProps}
      >
        <Animated.View
          style={props.containerStyle}
          ref={containerRef}
          onLayout={onContainerLayout}
          onTouchStart={onContainerTouchStart}
          onTouchEnd={onContainerTouchEnd}
        >
          <ScrollOffsetListener
            scrollOffset={scrollOffset}
            onScrollOffsetChange={([offset]) => {
              scrollOffsetRef.current = offset;
              props.onScrollOffsetChange?.(offset);
            }}
          />
          <PlaceholderItem renderPlaceholder={props.renderPlaceholder} />
          <AnimatedFlatList
            {...props}
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
          <Animated.Code dependencies={[]}>
            {() =>
              block([
                onChange(
                  isTouchActiveNative,
                  cond(not(isTouchActiveNative), onGestureRelease)
                ),
              ])
            }
          </Animated.Code>
        </Animated.View>
      </PanGestureHandler>
    </DraggableFlatListProvider>
  );
}
