import React from "react";
import {
  Platform,
  StyleSheet,
  VirtualizedListProps,
  findNodeHandle,
  ViewStyle,
  FlatList as RNFlatList,
  NativeScrollEvent
} from "react-native";
import {
  PanGestureHandler,
  State as GestureState,
  FlatList,
  GestureHandlerGestureEventNativeEvent,
  PanGestureHandlerEventExtra
} from "react-native-gesture-handler";
import Animated from "react-native-reanimated";
import { springFill, setupCell } from "./procs";

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

const {
  Value,
  abs,
  set,
  cond,
  add,
  sub,
  event,
  block,
  eq,
  neq,
  and,
  or,
  call,
  onChange,
  divide,
  greaterThan,
  greaterOrEq,
  lessOrEq,
  not,
  Clock,
  clockRunning,
  startClock,
  stopClock,
  spring,
  defined,
  max,
  debug
} = Animated;

// Fire onScrollComplete when within this many
// px of target offset
const scrollPositionTolerance = 2;
const defaultAnimationConfig = {
  damping: 20,
  mass: 0.2,
  stiffness: 100,
  overshootClamping: false,
  restSpeedThreshold: 0.2,
  restDisplacementThreshold: 0.2
};

const defaultProps = {
  autoscrollThreshold: 30,
  autoscrollSpeed: 100,
  animationConfig: defaultAnimationConfig as Animated.SpringConfig,
  scrollEnabled: true,
  activationDistance: 0
};

type DefaultProps = Readonly<typeof defaultProps>;

const debugGestureState = (state: GestureState, context: string) => {
  const stateStr = Object.entries(GestureState).find(([k, v]) => v === state);
  console.log(`## ${context} debug gesture state: ${state} - ${stateStr}`);
};

type AnimatedFlatListType<T> = { getNode: () => RNFlatList<T> };

export type DragEndParams<T> = {
  data: T[];
  from: number;
  to: number;
};

export type RenderItemParams<T> = {
  item: T;
  index?: number; // This is technically a "last known index" since cells don't necessarily rerender when their index changes
  drag: () => void;
  isActive: boolean;
};

type Modify<T, R> = Omit<T, keyof R> & R;
type Props<T> = Modify<
  VirtualizedListProps<T>,
  {
    autoscrollSpeed?: number;
    autoscrollThreshold?: number;
    data: T[];
    onRef?: (ref: React.RefObject<AnimatedFlatListType<T>>) => void;
    onDragBegin?: (index: number) => void;
    onRelease?: (index: number) => void;
    onDragEnd?: (params: DragEndParams<T>) => void;
    renderItem: (params: RenderItemParams<T>) => React.ReactNode;
    animationConfig: Partial<Animated.SpringConfig>;
    activationDistance?: number;
    debug?: boolean;
    layoutInvalidationKey?: string;
  } & Partial<DefaultProps>
>;

type State = {
  activeKey: string | null;
  hoverComponent: React.ReactNode | null;
};

type CellData = {
  size: Animated.Value<number>;
  offset: Animated.Value<number>;
  measurements: {
    size: number;
    offset: number;
  };
  style: Animated.AnimateProps<ViewStyle, {}>;
  currentIndex: Animated.Value<number>;
  onLayout: () => void;
  onUnmount: () => void;
};

// Run callback on next paint:
// https://stackoverflow.com/questions/26556436/react-after-render-code
function onNextFrame(callback: () => void) {
  setTimeout(function() {
    requestAnimationFrame(callback);
  });
}

class DraggableFlatList<T> extends React.Component<Props<T>, State> {
  state: State = {
    activeKey: null,
    hoverComponent: null
  };

  containerRef = React.createRef<Animated.View>();
  flatlistRef = React.createRef<AnimatedFlatListType<T>>();
  panGestureHandlerRef = React.createRef<PanGestureHandler>();

  containerSize = new Value<number>(0);

  activationDistance = new Value<number>(0);
  touchAbsolute = new Value<number>(0);
  touchCellOffset = new Value<number>(0);
  panGestureState = new Value(GestureState.UNDETERMINED);

  isPressedIn = {
    native: new Value<number>(0),
    js: false
  };

  hasMoved = new Value(0);
  disabled = new Value(0);

  activeIndex = new Value<number>(-1);
  isHovering = greaterThan(this.activeIndex, -1);

  spacerIndex = new Value<number>(-1);
  activeCellSize = new Value<number>(0);

  scrollOffset = new Value<number>(0);
  scrollViewSize = new Value<number>(0);
  isScrolledUp = lessOrEq(sub(this.scrollOffset, scrollPositionTolerance), 0);
  isScrolledDown = greaterOrEq(
    add(this.scrollOffset, this.containerSize, scrollPositionTolerance),
    this.scrollViewSize
  );
  hoverAnim = sub(this.touchAbsolute, this.touchCellOffset);
  hoverMid = add(this.hoverAnim, divide(this.activeCellSize, 2));
  hoverOffset = add(this.hoverAnim, this.scrollOffset);

  hoverTo = new Value(0);
  hoverClock = new Clock();
  hoverAnimState = {
    finished: new Value(0),
    velocity: new Value(0),
    position: new Value(0),
    time: new Value(0)
  };

  hoverAnimConfig = {
    ...defaultAnimationConfig,
    ...this.props.animationConfig,
    toValue: this.hoverTo
  };

  distToTopEdge = max(0, this.hoverAnim);
  distToBottomEdge = max(
    0,
    sub(this.containerSize, add(this.hoverAnim, this.activeCellSize))
  );

  cellAnim = new Map<
    string,
    {
      config: Animated.SpringConfig;
      state: Animated.SpringState;
      clock: Animated.Clock;
    }
  >();
  cellData = new Map<string, CellData>();
  cellRefs = new Map<string, React.RefObject<Animated.View>>();

  moveEndParams = [this.activeIndex, this.spacerIndex];

  resetHoverSpring = [
    set(this.hoverAnimState.time, 0),
    set(this.hoverAnimState.position, this.hoverAnimConfig.toValue),
    set(this.touchAbsolute, this.hoverAnimConfig.toValue),
    set(this.touchCellOffset, 0),
    set(this.hoverAnimState.finished, 0),
    set(this.hoverAnimState.velocity, 0),
    set(this.hasMoved, 0)
  ];

  keyToIndex = new Map<string, number>();

  isAutoscrolling = {
    native: new Value<number>(0),
    js: false
  };

  queue: (() => void | Promise<void>)[] = [];

  static getDerivedStateFromProps(props: Props<any>) {
    return {
      extraData: props.extraData
    };
  }

  static defaultProps = defaultProps;

  constructor(props: Props<T>) {
    super(props);
    const { data, onRef } = props;
    data.forEach((item, index) => {
      const key = this.keyExtractor(item, index);
      this.keyToIndex.set(key, index);
    });
    onRef && onRef(this.flatlistRef);
  }

  dataHasChanged = (a: T[], b: T[]) => {
    const lengthHasChanged = a.length !== b.length;
    if (lengthHasChanged) return true;

    const aKeys = a.map((d, i) => this.keyExtractor(d, i));
    const bKeys = b.map((d, i) => this.keyExtractor(d, i));

    const sameKeys = aKeys.every(k => bKeys.includes(k));
    return !sameKeys;
  };

  componentDidUpdate = async (prevProps: Props<T>, prevState: State) => {
    if (prevProps.data !== this.props.data) {
      this.props.data.forEach((item, index) => {
        const key = this.keyExtractor(item, index);
        this.keyToIndex.set(key, index);
      });
      // Remeasure on next paint
      this.updateCellData(this.props.data);
      onNextFrame(this.flushQueue);
      const layoutInvalidationKeyHasChanged =
        prevProps.layoutInvalidationKey !== this.props.layoutInvalidationKey;

      if (
        layoutInvalidationKeyHasChanged ||
        this.dataHasChanged(prevProps.data, this.props.data)
      ) {
        this.queue.push(() => this.measureAll(this.props.data));
      }
    }

    if (!prevState.activeKey && this.state.activeKey) {
      const index = this.keyToIndex.get(this.state.activeKey);
      if (index !== undefined) {
        this.spacerIndex.setValue(index);
        this.activeIndex.setValue(index);
        this.touchCellOffset.setValue(0);
        this.isPressedIn.native.setValue(1);
      }
      const cellData = this.cellData.get(this.state.activeKey);
      if (cellData) {
        this.touchAbsolute.setValue(sub(cellData.offset, this.scrollOffset));
        this.activeCellSize.setValue(cellData.measurements.size);
      }
    }
  };

  flushQueue = async () => {
    this.queue.forEach(fn => fn());
    this.queue = [];
  };

  resetHoverState = () => {
    this.activeIndex.setValue(-1);
    this.spacerIndex.setValue(-1);
    this.disabled.setValue(0);
    if (this.state.hoverComponent !== null || this.state.activeKey !== null) {
      this.setState({
        hoverComponent: null,
        activeKey: null
      });
    }
  };

  drag = (hoverComponent: React.ReactNode, activeKey: string) => {
    if (this.state.hoverComponent) {
      // We can't drag more than one row at a time
      // TODO: Put action on queue?
      console.log("## Can't set multiple active items");
    } else {
      this.isPressedIn.js = true;

      this.setState(
        {
          activeKey,
          hoverComponent
        },
        () => {
          const index = this.keyToIndex.get(activeKey);
          const { onDragBegin } = this.props;
          if (index !== undefined && onDragBegin) {
            onDragBegin(index);
          }
        }
      );
    }
  };

  onRelease = ([index]: readonly number[]) => {
    const { onRelease } = this.props;
    this.isPressedIn.js = false;
    onRelease && onRelease(index);
  };

  onDragEnd = ([from, to]: readonly number[]) => {
    const { onDragEnd } = this.props;
    if (onDragEnd) {
      const { data } = this.props;
      let newData = [...data];
      if (from !== to) {
        newData.splice(from, 1);
        newData.splice(to, 0, data[from]);
      }

      onDragEnd({ from, to, data: newData });
    }

    const lo = Math.min(from, to) - 1;
    const hi = Math.max(from, to) + 1;
    for (let i = lo; i < hi; i++) {
      this.queue.push(() => {
        const item = this.props.data[i];
        if (!item) return;
        const key = this.keyExtractor(item, i);
        return this.measureCell(key);
      });
    }

    this.resetHoverState();
  };

  updateCellData = (data: T[] = []) =>
    data.forEach((item: T, index: number) => {
      const key = this.keyExtractor(item, index);
      const cell = this.cellData.get(key);
      if (cell) cell.currentIndex.setValue(index);
    });

  setCellData = (key: string, index: number) => {
    const clock = new Clock();
    const currentIndex = new Value(index);

    const config = {
      ...this.hoverAnimConfig,
      toValue: new Value(0)
    };

    const state = {
      position: new Value(0),
      velocity: new Value(0),
      time: new Value(0),
      finished: new Value(0)
    };

    this.cellAnim.set(key, { clock, state, config });

    const initialized = new Value(0);
    const size = new Value<number>(0);
    const offset = new Value<number>(0);
    const isAfterActive = new Value(0);
    const translate = new Value(0);

    const runSrping = cond(
      clockRunning(clock),
      springFill(clock, state, config)
    );
    const onHasMoved = startClock(clock);
    const onChangeSpacerIndex = cond(clockRunning(clock), stopClock(clock));

    const onFinished = stopClock(clock);

    const prevTrans = new Value(0);
    const prevSpacerIndex = new Value(-1);

    const anim = setupCell(
      currentIndex,
      initialized,
      size,
      offset,
      isAfterActive,
      translate,
      prevTrans,
      prevSpacerIndex,
      this.activeIndex,
      this.activeCellSize,
      this.hoverOffset,
      this.scrollOffset,
      this.isHovering,
      this.hoverTo,
      this.hasMoved,
      this.spacerIndex,
      config.toValue,
      state.position,
      state.time,
      state.finished,
      runSrping,
      onHasMoved,
      onChangeSpacerIndex,
      onFinished,
      this.isPressedIn.native
    );

    const tapState = new Value<GestureState>(GestureState.UNDETERMINED);
    const transform = this.props.horizontal
      ? [{ translateX: anim }]
      : [{ translateY: anim }];

    const style = {
      transform
    };

    const cellData = {
      initialized,
      currentIndex,
      size,
      offset,
      style,
      onLayout: () => {
        if (this.state.activeKey !== key) this.measureCell(key);
      },
      onUnmount: () => initialized.setValue(0),
      measurements: {
        size: 0,
        offset: 0
      }
    };
    this.cellData.set(key, cellData);
  };

  measureAll = (data: T[]) => {
    data.forEach((d, i) => {
      const key = this.keyExtractor(d, i);
      this.measureCell(key);
    });
  };

  measureCell = (key: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const { horizontal } = this.props;

      const onSuccess = (x: number, y: number, w: number, h: number) => {
        const { activeKey } = this.state;
        const isHovering = activeKey !== null;
        const cellData = this.cellData.get(key);
        const thisKeyIndex = this.keyToIndex.get(key);
        const activeKeyIndex = activeKey
          ? this.keyToIndex.get(activeKey)
          : undefined;
        const baseOffset = horizontal ? x : y;
        let extraOffset = 0;
        if (
          thisKeyIndex !== undefined &&
          activeKeyIndex !== undefined &&
          activeKey
        ) {
          const isAfterActive = thisKeyIndex > activeKeyIndex;
          const activeCellData = this.cellData.get(activeKey);
          if (isHovering && isAfterActive && activeCellData) {
            extraOffset = activeCellData.measurements.size;
          }
        }

        const size = horizontal ? w : h;
        const offset = baseOffset + extraOffset;
        // console.log(`measure key ${key}: wdith ${w} height ${h} x ${x} y ${y} size ${size} offset ${offset}`)
        if (cellData) {
          cellData.size.setValue(size);
          cellData.offset.setValue(offset);
          cellData.measurements.size = size;
          cellData.measurements.offset = offset;
        }

        // remeasure on next layout if hovering
        if (isHovering) this.queue.push(() => this.measureCell(key));
        resolve();
      };

      const onFail = () => {
        console.log("## measureLayout fail!", key);
      };

      const ref = this.cellRefs.get(key);
      const viewNode = ref && ref.current && ref.current.getNode();
      const flatListNode =
        this.flatlistRef.current && this.flatlistRef.current.getNode();

      if (viewNode && flatListNode) {
        const nodeHandle = findNodeHandle(flatListNode);
        if (nodeHandle) viewNode.measureLayout(nodeHandle, onSuccess, onFail);
      } else {
        let reason = !ref
          ? "no ref"
          : !flatListNode
          ? "no flatlist node"
          : "invalid ref";
        console.log(`## can't measure ${key} reason: ${reason}`);
        this.queue.push(() => this.measureCell(key));
        return resolve();
      }
    });
  };

  keyExtractor = (item: T, index: number) => {
    if (this.props.keyExtractor) return this.props.keyExtractor(item, index);
    else
      throw new Error("You must provide a keyExtractor to DraggableFlatList");
  };

  onContainerLayout = () => {
    const { horizontal } = this.props;
    const containerRef = this.containerRef.current;
    if (containerRef) {
      containerRef.getNode().measure((x, y, w, h) => {
        this.containerSize.setValue(horizontal ? w : h);
      });
    }
  };

  onListContentSizeChange = (w: number, h: number) => {
    this.scrollViewSize.setValue(this.props.horizontal ? w : h);
    if (this.props.onContentSizeChange) this.props.onContentSizeChange(w, h);
  };

  targetScrollOffset = new Value<number>(0);
  resolveAutoscroll?: (scrollParams: readonly number[]) => void;

  onAutoscrollComplete = (params: readonly number[]) => {
    this.isAutoscrolling.js = false;
    if (this.resolveAutoscroll) this.resolveAutoscroll(params);
  };

  scrollToAsync = (offset: number): Promise<readonly number[]> =>
    new Promise((resolve, reject) => {
      this.resolveAutoscroll = resolve;
      this.targetScrollOffset.setValue(offset);
      this.isAutoscrolling.native.setValue(1);
      this.isAutoscrolling.js = true;
      const flatlistRef = this.flatlistRef.current;
      if (flatlistRef) flatlistRef.getNode().scrollToOffset({ offset });
    });

  getScrollTargetOffset = (
    distFromTop: number,
    distFromBottom: number,
    scrollOffset: number,
    isScrolledUp: boolean,
    isScrolledDown: boolean
  ) => {
    if (this.isAutoscrolling.js) return -1;
    const { autoscrollThreshold, autoscrollSpeed } = this.props;
    const scrollUp = distFromTop < autoscrollThreshold!;
    const scrollDown = distFromBottom < autoscrollThreshold!;
    if (
      !(scrollUp || scrollDown) ||
      (scrollUp && isScrolledUp) ||
      (scrollDown && isScrolledDown)
    )
      return -1;
    const distFromEdge = scrollUp ? distFromTop : distFromBottom;
    const speedPct = 1 - distFromEdge / autoscrollThreshold!;
    // Android scroll speed seems much faster than ios
    const speed =
      Platform.OS === "ios" ? autoscrollSpeed! : autoscrollSpeed! / 10;
    const offset = speedPct * speed;
    const targetOffset = scrollUp
      ? Math.max(0, scrollOffset - offset)
      : scrollOffset + offset;
    return targetOffset;
  };

  autoscroll = async ([
    distFromTop,
    distFromBottom,
    scrollOffset,
    isScrolledUp,
    isScrolledDown
  ]: readonly number[]) => {
    const targetOffset = this.getScrollTargetOffset(
      distFromTop,
      distFromBottom,
      scrollOffset,
      !!isScrolledUp,
      !!isScrolledDown
    );
    if (targetOffset >= 0 && this.isPressedIn.js) {
      const nextScrollParams = await this.scrollToAsync(targetOffset);
      this.autoscroll(nextScrollParams);
    }
  };

  isAtTopEdge = lessOrEq(this.distToTopEdge, this.props.autoscrollThreshold!);
  isAtBottomEdge = lessOrEq(
    this.distToBottomEdge,
    this.props.autoscrollThreshold!
  );
  isAtEdge = or(this.isAtBottomEdge, this.isAtTopEdge);

  autoscrollParams = [
    this.distToTopEdge,
    this.distToBottomEdge,
    this.scrollOffset,
    this.isScrolledUp,
    this.isScrolledDown
  ];

  checkAutoscroll = cond(
    and(
      this.isAtEdge,
      not(and(this.isAtTopEdge, this.isScrolledUp)),
      not(and(this.isAtBottomEdge, this.isScrolledDown)),
      eq(this.panGestureState, GestureState.ACTIVE),
      not(this.isAutoscrolling.native)
    ),
    call(this.autoscrollParams, this.autoscroll)
  );

  onScroll = event([
    {
      nativeEvent: ({ contentOffset }: NativeScrollEvent) =>
        block([
          set(
            this.scrollOffset,
            this.props.horizontal ? contentOffset.x : contentOffset.y
          ),
          cond(
            and(
              this.isAutoscrolling.native,
              or(
                lessOrEq(
                  abs(sub(this.targetScrollOffset, this.scrollOffset)),
                  scrollPositionTolerance
                ),
                this.isScrolledUp,
                this.isScrolledDown
              )
            ),
            [
              set(this.isAutoscrolling.native, 0),
              this.checkAutoscroll,
              call(this.autoscrollParams, this.onAutoscrollComplete)
            ]
          )
        ])
    }
  ]);

  onGestureRelease = [
    set(this.isPressedIn.native, 0),
    cond(
      this.isHovering,
      [
        set(this.disabled, 1),
        cond(defined(this.hoverClock), [
          cond(clockRunning(this.hoverClock), stopClock(this.hoverClock)),
          set(this.hoverAnimState.position, this.hoverAnim),
          startClock(this.hoverClock)
        ]),
        call([this.activeIndex], this.onRelease)
      ],
      call([this.activeIndex], this.resetHoverState)
    )
  ];

  onPanStateChange = event([
    {
      nativeEvent: ({
        state,
        x,
        y
      }: GestureHandlerGestureEventNativeEvent & PanGestureHandlerEventExtra) =>
        cond(and(neq(state, this.panGestureState), not(this.disabled)), [
          set(this.panGestureState, state),
          cond(
            eq(this.panGestureState, GestureState.ACTIVE),
            set(
              this.activationDistance,
              sub(this.touchAbsolute, this.props.horizontal ? x : y)
            )
          ),
          cond(
            or(
              eq(state, GestureState.END),
              eq(state, GestureState.CANCELLED),
              eq(state, GestureState.FAILED)
            ),
            this.onGestureRelease
          )
        ])
    }
  ]);

  onPanGestureEvent = event([
    {
      nativeEvent: ({ x, y }: PanGestureHandlerEventExtra) =>
        cond(
          and(
            this.isHovering,
            eq(this.panGestureState, GestureState.ACTIVE),
            not(this.disabled)
          ),
          [
            cond(not(this.hasMoved), set(this.hasMoved, 1)),
            set(
              this.touchAbsolute,
              add(this.props.horizontal ? x : y, this.activationDistance)
            )
          ]
        )
    }
  ]);

  hoverComponentTranslate = cond(
    clockRunning(this.hoverClock),
    this.hoverAnimState.position,
    this.hoverAnim
  );

  hoverComponentOpacity = and(
    this.isHovering,
    neq(this.panGestureState, GestureState.CANCELLED)
  );

  renderHoverComponent = () => {
    const { hoverComponent } = this.state;
    const { horizontal } = this.props;

    return (
      <Animated.View
        style={[
          horizontal
            ? styles.hoverComponentHorizontal
            : styles.hoverComponentVertical,
          {
            opacity: this.hoverComponentOpacity,
            transform: [
              {
                [`translate${horizontal ? "X" : "Y"}`]: this
                  .hoverComponentTranslate
              }
            ]
          }
        ]}
      >
        {hoverComponent}
      </Animated.View>
    );
  };

  renderItem = ({ item, index }: { item: T; index: number }) => {
    const key = this.keyExtractor(item, index);
    const { renderItem } = this.props;
    if (!this.cellData.get(key)) this.setCellData(key, index);
    const { onUnmount } = this.cellData.get(key) || {
      onUnmount: () => console.log("## error, no cellData")
    };
    return (
      <RowItem
        extraData={this.props.extraData}
        itemKey={key}
        keyToIndex={this.keyToIndex}
        renderItem={renderItem}
        item={item}
        drag={this.drag}
        onUnmount={onUnmount}
      />
    );
  };

  CellRendererComponent = (cellProps: any) => {
    const { item, index, children, onLayout } = cellProps;
    const { horizontal } = this.props;
    const { activeKey } = this.state;
    const key = this.keyExtractor(item, index);
    if (!this.cellData.get(key)) this.setCellData(key, index);
    const cellData = this.cellData.get(key);
    if (!cellData) return null;
    const { style, onLayout: onCellLayout } = cellData;
    let ref = this.cellRefs.get(key);
    if (!ref) {
      ref = React.createRef();
      this.cellRefs.set(key, ref);
    }
    const isActiveCell = activeKey === key;
    return (
      <Animated.View onLayout={onLayout} style={style}>
        <Animated.View
          pointerEvents={activeKey ? "none" : "auto"}
          style={{
            flexDirection: horizontal ? "row" : "column"
          }}
        >
          <Animated.View
            ref={ref}
            onLayout={onCellLayout}
            style={isActiveCell ? { opacity: 0 } : undefined}
          >
            {children}
          </Animated.View>
        </Animated.View>
      </Animated.View>
    );
  };

  renderDebug() {
    return (
      <Animated.Code>
        {() =>
          block([
            onChange(this.spacerIndex, debug("spacerIndex: ", this.spacerIndex))
          ])
        }
      </Animated.Code>
    );
  }

  render() {
    const { scrollEnabled, debug, horizontal, activationDistance } = this.props;
    const { hoverComponent } = this.state;
    let dynamicProps = {};
    if (activationDistance) {
      const activeOffset = [-activationDistance, activationDistance];
      dynamicProps = horizontal
        ? { activeOffsetX: activeOffset }
        : { activeOffsetY: activeOffset };
    }
    return (
      <PanGestureHandler
        ref={this.panGestureHandlerRef}
        onGestureEvent={this.onPanGestureEvent}
        onHandlerStateChange={this.onPanStateChange}
        {...dynamicProps}
      >
        <Animated.View
          style={styles.flex}
          ref={this.containerRef}
          onLayout={this.onContainerLayout}
        >
          <AnimatedFlatList
            {...this.props}
            CellRendererComponent={this.CellRendererComponent}
            ref={this.flatlistRef}
            onContentSizeChange={this.onListContentSizeChange}
            scrollEnabled={!hoverComponent && scrollEnabled}
            renderItem={this.renderItem}
            extraData={this.state}
            keyExtractor={this.keyExtractor}
            onScroll={this.onScroll}
            scrollEventThrottle={1}
          />
          {!!hoverComponent && this.renderHoverComponent()}
          {debug && this.renderDebug()}
          <Animated.Code>
            {() =>
              block([
                onChange(this.touchAbsolute, this.checkAutoscroll),
                cond(clockRunning(this.hoverClock), [
                  spring(
                    this.hoverClock,
                    this.hoverAnimState,
                    this.hoverAnimConfig
                  ),
                  cond(eq(this.hoverAnimState.finished, 1), [
                    stopClock(this.hoverClock),
                    call(this.moveEndParams, this.onDragEnd),
                    this.resetHoverSpring,
                    set(this.hasMoved, 0)
                  ])
                ])
              ])
            }
          </Animated.Code>
        </Animated.View>
      </PanGestureHandler>
    );
  }
}

export default DraggableFlatList;

type RowItemProps<T> = {
  extraData?: any;
  drag: (hoverComponent: React.ReactNode, itemKey: string) => void;
  keyToIndex: Map<string, number>;
  item: T;
  renderItem: (params: RenderItemParams<T>) => React.ReactNode;
  itemKey: string;
  onUnmount: () => void;
};

class RowItem<T> extends React.PureComponent<RowItemProps<T>> {
  drag = () => {
    const { drag, renderItem, item, keyToIndex, itemKey } = this.props;
    const hoverComponent = renderItem({
      isActive: true,
      item,
      index: keyToIndex.get(itemKey),
      drag: () => console.log("## attempt to call drag() on hovering component")
    });
    drag(hoverComponent, itemKey);
  };

  componentWillUnmount() {
    this.props.onUnmount();
  }

  render() {
    const { renderItem, item, keyToIndex, itemKey } = this.props;
    return renderItem({
      isActive: false,
      item,
      index: keyToIndex.get(itemKey),
      drag: this.drag
    });
  }
}

const styles = StyleSheet.create({
  flex: {
    flex: 1
  },
  hoverComponentVertical: {
    position: "absolute",
    left: 0,
    right: 0
  },
  hoverComponentHorizontal: {
    position: "absolute",
    bottom: 0,
    top: 0
  }
});
