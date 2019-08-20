import * as React from 'react'
import {
  Platform,
  StatusBar,
  StyleSheet,
  VirtualizedListProps,
  findNodeHandle,
} from 'react-native'
import {
  PanGestureHandler,
  TapGestureHandler,
  State as GestureState,
  FlatList
} from "react-native-gesture-handler"
import Animated from "react-native-reanimated"

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList)

const {
  Value,
  abs,
  set,
  cond,
  add,
  sub,
  event,
  block,
  debug,
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
} = Animated

// Fire onScrollComplete when within this many
// px of target offset
const onScrollCompleteThreshold = 2

const debugGestureState = (state, context) => {
  const stateStr = Object.entries(GestureState).find(([k, v]) => v === state)
  console.log(`## ${context} debug gesture state: ${state} - ${stateStr}`)
}

interface Props<T> extends VirtualizedListProps<T> {
  autoScrollSpeed: number,
  autoscrollThreshold: number,
  horizontal: boolean,
  data: T[],
  onMoveBegin?: (index: number) => void,
  onRelease?: (index: number) => void,
  onMoveEnd?: (params: {
    data: T[],
    from: number,
    to: number,
  }) => void
  renderItem: (params: {
    item: T,
    index: number,
    move: (index: number) => void,
    isActive: boolean,
  }) => React.ComponentType
}

type State = {
  activeKey: string | null,
  hoverComponent: React.ComponentType | null,
}

type CellData = {
  size: Animated.Node<number>,
  offset: Animated.Node<number>,
  measurements: {
    size: number,
    offset: number,
  },
  translate: Animated.Node<number>,
  currentIndex: Animated.Node<number>,
  onLayout: () => void,
  onCellTap: typeof event,
}

// Run callback on next paint:
// https://stackoverflow.com/questions/26556436/react-after-render-code
function onNextFrame(callback: () => void) {
  setTimeout(function () {
    requestAnimationFrame(callback)
  })
}

class DraggableFlatList<T> extends React.Component<Props<T>, State> {

  state = {
    activeKey: null,
    hoverComponent: null,
  }

  containerRef = React.createRef()
  flatlistRef = React.createRef()
  panGestureHandlerRef = React.createRef()
  tapGestureHandlerRef = React.createRef()

  containerOffset = new Value(0)
  androidStatusBarSize = new Value(0)
  containerEnd = new Value(0)
  containerSize = sub(this.containerEnd, this.containerOffset)

  touchAbsolute = new Value(0)
  touchCellOffset = new Value(0)
  panGestureState = new Value(-1)
  tapGestureState = new Value(0)
  hasMoved = new Value(0)
  disabled = new Value(0)

  activeIndex = new Value<number>(-1)
  isHovering = greaterThan(this.activeIndex, -1)

  spacerIndex = new Value<number>(-1)
  activeCellSize = new Value<number>(0)

  scrollOffset = new Value<number>(0)
  scrollViewSize = new Value<number>(0)
  isScrolledUp = lessOrEq(this.scrollOffset, 0)
  isScrolledDown = greaterOrEq(add(this.scrollOffset, this.containerSize), this.scrollViewSize)
  hoverAnim = sub(this.touchAbsolute, this.touchCellOffset, add(this.containerOffset, this.androidStatusBarSize))
  hoverMid = add(this.hoverAnim, divide(this.activeCellSize, 2))
  hoverOffset = add(this.hoverAnim, this.scrollOffset)

  // Stash a snapshot of scroll position at the time that 
  // translation occurs
  hoverScrollSnapshot = new Value(0)
  hoverScrollDiff = new Value(0)

  hoverTo = new Value(0)
  hoverClock = new Clock()
  hoverAnimState = {
    finished: new Value(0),
    velocity: new Value(0),
    position: new Value(0),
    time: new Value(0),
  }

  hoverAnimConfig = {
    damping: 20,
    mass: 0.2,
    stiffness: 100,
    overshootClamping: false,
    toValue: sub(this.hoverTo, sub(this.scrollOffset, this.hoverScrollSnapshot)),
    restSpeedThreshold: 0.2,
    restDisplacementThreshold: 0.2,
  }

  distToTopEdge = max(0, this.hoverAnim)
  distToBottomEdge = max(0, sub(this.containerEnd, add(this.hoverAnim, this.activeCellSize)))

  cellAnim = new Map<string, {
    config: Animated.SpringConfig,
    state: Animated.SpringState,
    clock: Animated.Clock,
  }>()
  cellData = new Map<string, CellData>()
  cellRefs = new Map<string, React.RefObject<typeof Animated.View>>()

  moveEndParams = [this.activeIndex, this.spacerIndex]

  resetHoverSpring = [
    set(this.hoverAnimState.time, 0),
    set(this.hoverAnimState.position, this.hoverAnimConfig.toValue),
    set(this.touchAbsolute, this.hoverAnimConfig.toValue),
    set(this.touchCellOffset, 0),
    set(this.hoverAnimState.finished, 0),
    set(this.hoverAnimState.velocity, 0),
  ]

  static getDerivedStateFromProps(props: Props<any>) {
    return {
      extraData: props.extraData
    }
  }

  static defaultProps = {
    autoscrollThreshold: 30,
    autoScrollSpeed: 100
  }

  constructor(props: Props<T>) {
    super(props)
    this.setCellData(props.data)
  }

  componentDidMount() {
    if (Platform.OS === "android" && !this.props.horizontal) {
      // Android measurements do not account for StatusBar, 
      // so we must do so manually.
      const { hidden, translucent } = StatusBar._propsStack.reduce((acc, cur) => {
        if (cur.translucent !== undefined) acc.translucent = cur.translucent
        if (cur.hidden !== null) acc.hidden = cur.hidden.value
        return acc
      }, { hidden: false, translucent: false })
      if (!(hidden || translucent)) this.androidStatusBarSize.setValue(StatusBar.currentHeight)
    }
  }

  componentDidUpdate = async (prevProps: Props<T>) => {
    if (prevProps.data !== this.props.data) {
      // Remeasure on next paint  
      this.setCellData(this.props.data)
      onNextFrame(this.flushQueue)
      this.disabled.setValue(0)
      console.log('new data!!', this.props.data)
    }
  }

  queue: (() => Promise<void>[])[] = []
  flushQueue = async () => {
    for (let fn of this.queue) {
      await Promise.all(fn())
    }
    this.queue = []
  }

  move = (hoverComponent: React.ComponentType, index: number, activeKey: string) => {

    if (this.state.hoverComponent) {
      // We can't move more than one row at a time
      // TODO: Put action on queue?
      console.log("## Can't set multiple active items")
    } else {
      this.isPressedIn.js = true
      this.spacerIndex.setValue(index)
      this.activeIndex.setValue(index)
      console.log('setting active cell!!', activeKey)
      this.activeCellSize.setValue(this.cellData.get(activeKey).size)

      this.setState({
        activeKey,
        hoverComponent,
      }, () => {
        const { onMoveBegin } = this.props
        onMoveBegin && onMoveBegin(index)
      }
      )
    }
  }

  onRelease = ([index]: readonly number[]) => {
    const { onRelease } = this.props
    console.log('ON RELEASE', index)
    this.isPressedIn.js = false
    onRelease && onRelease(index)
  }

  onMoveEnd = ([from, to]: readonly number[]) => {
    console.log(`move from ${from} to ${to}`)
    const { onMoveEnd } = this.props
    if (onMoveEnd) {
      const { data } = this.props
      let newData = [...data]
      if (from !== to) {
        newData.splice(from, 1)
        newData.splice(to, 0, data[from])
      }

      onMoveEnd({ from, to, data: newData })
    }

    const onUpdate = () => {
      const lo = Math.min(from, to) - 1
      const hi = Math.max(from, to) + 1
      console.log(`OME measure: lo ${lo} hi ${hi}`)
      const promises: Promise<void>[] = []
      for (let i = lo; i < hi; i++) {
        const item = this.props.data[i]
        if (!item) continue
        const key = this.keyExtractor(item, i)
        promises.push(this.measureCell(key))
      }
      return promises
    }

    this.setState({
      activeKey: null,
      hoverComponent: null,
    })

    this.queue.push(onUpdate)
    this.spacerIndex.setValue(-1)
    this.activeIndex.setValue(-1)
  }

  setCellData = (data: T[] = []) => {
    data.forEach((item, index) => {
      const key = this.keyExtractor(item, index)
      const cell = this.cellData.get(key)

      if (cell) {
        // If key is already instantiated, all
        // we need to do is update its index
        cell.currentIndex.setValue(index)
        return
      }

      const currentIndex = new Value(index)

      const clock = new Clock()
      const config = {
        ...this.hoverAnimConfig,
        toValue: new Value(0),
      }

      const state = {
        position: new Value(0),
        velocity: new Value(0),
        time: new Value(0),
        finished: new Value(0),
      }

      this.cellAnim.set(key, { clock, config, state })

      const runClock = block([
        cond(clockRunning(clock), [
          spring(clock, state, config),
          cond(state.finished, [
            stopClock(clock),
            set(state.time, 0),
            set(state.finished, 0),
          ]),
        ]),
        state.position,
      ])

      const size = new Value(0)
      const offset = new Value(0)

      const midpoint = add(offset, divide(size, 2))
      const isAfterActive = greaterThan(currentIndex, this.activeIndex)

      const hoverMid = cond(
        isAfterActive,
        sub(midpoint, this.activeCellSize),
        midpoint,
      )
      const isAfterHoverMid = greaterOrEq(hoverMid, this.hoverOffset)

      const translate = cond(and(
        this.isHovering,
        neq(currentIndex, this.activeIndex)
      ), [
          cond(isAfterHoverMid, this.activeCellSize, 0),
        ],
        0)

      const cellStart = cond(isAfterActive, [
        sub(
          sub(add(offset, size), this.activeCellSize), this.scrollOffset)
      ], [
          sub(offset, this.scrollOffset)
        ])

      const isShifted = greaterThan(translate, 0)

      const onChangeTranslate = onChange(translate, [
        set(this.hoverScrollSnapshot, this.scrollOffset),
        set(this.hoverTo,
          cond(isAfterActive, cond(isShifted, [sub(cellStart, size)], [cellStart]), [
            cond(isShifted, [cellStart], [add(cellStart, size)])
          ])
        ),
        cond(not(this.hasMoved), set(state.position, translate)),
        cond(and(
          not(isAfterActive),
          greaterThan(translate, 0)
        ),
          set(this.spacerIndex, currentIndex)
        ),
        cond(and(
          not(isAfterActive),
          eq(translate, 0),
        ),
          set(this.spacerIndex, add(currentIndex, 1))
        ),
        cond(and(
          isAfterActive,
          eq(translate, 0),
        ),
          set(this.spacerIndex, currentIndex),
        ),
        cond(and(
          isAfterActive,
          greaterThan(translate, 0),
        ),
          set(this.spacerIndex, sub(currentIndex, 1))
        ),
        set(config.toValue, translate),
        cond(this.hasMoved, startClock(clock)),
      ])

      const onChangeSpacerIndex = onChange(this.spacerIndex, [
        cond(eq(this.spacerIndex, -1), [
          // Hard reset to prevent stale state bugs
          cond(clockRunning(clock), stopClock(clock)),
          set(state.position, 0),
          set(state.finished, 0),
          set(state.time, 0),
          set(config.toValue, 0),
        ]),
      ])

      const tapState = new Value<number>(0)


      const cellData = {
        currentIndex,
        size,
        offset,
        onLayout: async () => {
          if (this.state.activeKey !== key) this.measureCell(key)
        },
        onCellTap: event([{
          nativeEvent: ({ state, y, x }) => block([
            cond(and(
              neq(state, tapState),
              not(this.disabled),
            )
              , [
                set(tapState, state),
                call([tapState], ([st]) => debugGestureState(st, 'TAP')),
                cond(eq(state, GestureState.BEGAN), [
                  set(this.touchCellOffset, this.props.horizontal ? x : y),
                ]),
                cond(eq(state, GestureState.END), [
                  call([tapState], ([st]) => debugGestureState(st, "END TAP")),
                  this.onGestureRelease
                ])
              ]
            )
          ])
        }]),
        measurements: {
          size: 0,
          offset: 0,
        },
        translate: block([
          onChangeTranslate,
          onChangeSpacerIndex,
          cond(
            this.hasMoved,
            cond(this.isHovering, runClock, 0),
            translate
          )
        ]),
      }
      this.cellData.set(key, cellData)
    })
  }

  measureCell = (key: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const { horizontal } = this.props
      const { activeKey } = this.state
      const ref = this.cellRefs.get(key)

      const isHovering = activeKey !== null
      const noRef = !ref
      const invalidRef = !noRef && !(ref.current && ref.current._component)
      if (isHovering || noRef || invalidRef) {
        let reason = isHovering ? "is hovering" : noRef ? "no ref" : "invalid ref"
        console.log(`## can't measure ${key} reason: ${reason}`)
        return resolve()
      }

      ref.current._component.measureLayout(findNodeHandle(this.flatlistRef.current), (x, y, w, h) => {
        // console.log(`measure key ${key}: wdith ${w} height ${h} x ${x} y ${y}`)
        const cellData = this.cellData.get(key)
        const size = horizontal ? w : h
        const offset = horizontal ? x : y
        cellData.size.setValue(size)
        cellData.offset.setValue(offset)
        cellData.measurements.size = size
        cellData.measurements.offset = offset
        resolve()
      });
    })
  }

  keyExtractor = (item, index) => {
    if (this.props.keyExtractor) return this.props.keyExtractor(item, index)
    else throw new Error('You must provide a keyExtractor to DraggableFlatList')
  }

  onContainerLayout = () => {
    const { horizontal } = this.props
    this.containerRef.current._component.measure((x, y, w, h, pageX, pageY) => {
      console.log(`container layout x ${x} y ${y} w ${w} h ${h} pageX ${pageX} pageY ${pageY}`)
      this.containerOffset.setValue(horizontal ? pageX : pageY)
      this.containerEnd.setValue(add(this.containerOffset, horizontal ? w : h))
    })
  }

  onListContentSizeChange = (w: number, h: number) => {
    this.scrollViewSize.setValue(this.props.horizontal ? w : h)
  }

  isAutoscrolling = {
    native: new Value<number>(0),
    js: false,
  }

  isPressedIn = {
    native: new Value<number>(0),
    js: false,
  }

  targetScrollOffset = new Value<number>(0)
  resolveAutoscroll?: (scrollParams: readonly number[]) => void

  onAutoscrollComplete = (params: readonly number[]) => {
    this.isAutoscrolling.js = false
    if (this.resolveAutoscroll) this.resolveAutoscroll(params)
  }

  scrollToAsync = (offset: number): Promise<readonly number[]> => new Promise((resolve, reject) => {
    this.resolveAutoscroll = resolve
    this.targetScrollOffset.setValue(offset)
    this.isAutoscrolling.native.setValue(1)
    this.isAutoscrolling.js = true
    this.flatlistRef.current._component.scrollToOffset({ offset })
  })

  getScrollTargetOffset = (
    distFromTop: number,
    distFromBottom: number,
    scrollOffset: number,
    isScrolledUp: boolean,
    isScrolledDown: boolean,
  ) => {
    if (this.isAutoscrolling.js) return -1
    const { autoscrollThreshold } = this.props
    const scrollUp = distFromTop < autoscrollThreshold
    const scrollDown = distFromBottom < autoscrollThreshold
    if (!(scrollUp || scrollDown) || scrollUp && isScrolledUp || scrollDown && isScrolledDown) return -1
    const distFromEdge = scrollUp ? distFromTop : distFromBottom
    const speedPct = 1 - (distFromEdge / autoscrollThreshold)
    const offset = speedPct * this.props.autoScrollSpeed
    const targetOffset = scrollUp ? Math.max(0, scrollOffset - offset) : scrollOffset + offset
    return targetOffset
  }

  autoscroll = async ([
    distFromTop,
    distFromBottom,
    scrollOffset,
    isScrolledUp,
    isScrolledDown,
  ]: readonly number[]) => {
    const targetOffset = this.getScrollTargetOffset(
      distFromTop,
      distFromBottom,
      scrollOffset,
      !!isScrolledUp,
      !!isScrolledDown,
    )
    if (targetOffset >= 0 && this.isPressedIn.js) {
      const nextScrollParams = await this.scrollToAsync(targetOffset)
      this.autoscroll(nextScrollParams)
    }
  }

  isAtTopEdge = cond(
    lessOrEq(
      this.distToTopEdge,
      this.props.autoscrollThreshold
    ), 1, 0)

  isAtBottomEdge = cond(
    lessOrEq(
      this.distToBottomEdge,
      this.props.autoscrollThreshold
    ), 1, 0)

  isAtEdge = or(this.isAtBottomEdge, this.isAtTopEdge)

  checkAutoscroll = cond(
    and(
      this.isAtEdge,
      not(and(this.isAtTopEdge, this.isScrolledUp)),
      not(and(this.isAtBottomEdge, this.isScrolledDown)),
      eq(this.panGestureState, GestureState.ACTIVE),
      not(this.isAutoscrolling.native),
    ), [
      call([
        this.distToTopEdge,
        this.distToBottomEdge,
        this.scrollOffset,
        this.isScrolledUp,
        this.isScrolledDown,
      ], this.autoscroll),
    ])

  onScroll = event([
    {
      nativeEvent: ({ contentOffset }) => block([
        set(this.scrollOffset, this.props.horizontal ? contentOffset.x : contentOffset.y),
        cond(
          and(
            this.isAutoscrolling.native,
            or(
              lessOrEq(
                abs(sub(this.targetScrollOffset, this.scrollOffset)),
                onScrollCompleteThreshold
              ),
              this.isScrolledUp,
              this.isScrolledDown,
            )
          ), [
            set(this.isAutoscrolling.native, 0),
            this.checkAutoscroll,
            call([
              this.distToTopEdge,
              this.distToBottomEdge,
              this.scrollOffset,
              this.isScrolledUp,
              this.isScrolledDown,
            ], this.onAutoscrollComplete),
          ]),
      ])
    }
  ])

  onGestureRelease = [
    set(this.hasMoved, 0),
    cond(this.isHovering, [
      set(this.disabled, 1),
      cond(defined(this.hoverClock), [
        cond(clockRunning(this.hoverClock), stopClock(this.hoverClock)),
        set(this.hoverAnimState.position, this.hoverAnim),
        startClock(this.hoverClock),
      ], debug("## couldn 't find hover clock", this.activeIndex)),
      call([this.activeIndex], this.onRelease),
    ])
  ]

  onContainerTapStateChange = event([
    {
      nativeEvent: ({ state, absoluteX, absoluteY }) => block([
        cond(and(
          neq(state, this.tapGestureState),
          not(this.disabled),
        ), [
            set(this.tapGestureState, state),
            cond(eq(state, GestureState.BEGAN), [
              set(this.touchAbsolute, this.props.horizontal ? absoluteX : absoluteY),
            ]),
          ]),
      ])
    }
  ])

  onPanStateChange = event([
    {
      nativeEvent: ({ state }) => block([
        cond(and(
          neq(state, this.panGestureState),
          not(this.disabled),
        ), [
            set(this.panGestureState, state),
            cond(or(
              eq(state, GestureState.END),
              eq(state, GestureState.CANCELLED),
              eq(state, GestureState.FAILED),
            ), this.onGestureRelease),
          ]
        )
      ])
    }
  ])

  onPanGestureEvent = event([
    {
      nativeEvent: ({ absoluteY, absoluteX }) => block([
        cond(
          and(
            eq(this.panGestureState, GestureState.ACTIVE),
            not(this.disabled),
          ), [
            cond(not(this.hasMoved), set(this.hasMoved, 1)),
            set(this.touchAbsolute, this.props.horizontal ? absoluteX : absoluteY),
            onChange(this.touchAbsolute, this.checkAutoscroll),
          ])
      ]),
    },
  ])

  runHoverClock = cond(clockRunning(this.hoverClock), [
    spring(this.hoverClock, this.hoverAnimState, this.hoverAnimConfig),
    cond(eq(this.hoverAnimState.finished, 1), [
      stopClock(this.hoverClock),
      this.resetHoverSpring,
      call(this.moveEndParams, this.onMoveEnd),
      set(this.hasMoved, 0),
    ]),
    this.hoverAnimState.position
  ])

  renderHoverComponent = () => {
    const { hoverComponent } = this.state
    const { horizontal } = this.props

    return (
      <Animated.View style={[
        styles[`hoverComponent${horizontal ? "Horizontal" : "Vertical"}`],
        {
          transform: [{
            [`translate${horizontal ? "X" : "Y"}`]: block([
              cond(clockRunning(this.hoverClock), [
                this.runHoverClock,
              ], this.hoverAnim)
            ])
          }]
        }]}
      >
        {hoverComponent}
      </Animated.View>
    )
  }

  activeCellStyle = {
    [this.props.horizontal ? "width" : "height"]: 0,
    opacity: 0,
  }

  renderItem = ({ item, index }) => {
    const { renderItem, horizontal, data } = this.props
    const { activeKey } = this.state
    const key = this.keyExtractor(item, index)

    const { translate, onLayout, onCellTap } = this.cellData.get(key)
    const transform = [{ [`translate${horizontal ? 'X' : 'Y'}`]: translate }]
    let ref = this.cellRefs.get(key)
    if (!ref) {
      ref = React.createRef()
      this.cellRefs.set(key, ref)
    }

    const isActiveCell = activeKey === key
    const isLast = index === data.length - 1
    const activeCellData = this.cellData.get(activeKey)

    return (
      <Animated.View
        pointerEvents={activeKey ? "none" : "auto"}
        style={{
          transform,
          flexDirection: horizontal ? 'row' : 'column',
        }}
      >
        <TapGestureHandler
          onHandlerStateChange={onCellTap}
        >
          <Animated.View
            ref={ref}
            onLayout={onLayout}
            style={isActiveCell ? this.activeCellStyle : undefined}
          >

            <RowItem
              itemKey={key}
              index={index}
              renderItem={renderItem}
              item={item}
              move={this.move}
            />
          </Animated.View>
        </TapGestureHandler>
        {isLast && activeCellData ? (
          <Animated.View
            style={{
              opacity: 0,
              // The active cell is removed from the list, so we need to add its height to the end 
              // for our list to remain a consistent height
              [horizontal ? "width" : "height"]: activeCellData.measurements.size
            }}
          />
        ) : null}
      </Animated.View>
    )
  }

  render() {
    const { hoverComponent } = this.state
    return (
      <TapGestureHandler
        ref={this.tapGestureHandlerRef}
        onHandlerStateChange={this.onContainerTapStateChange}
      >
        <Animated.View style={styles.flex}>
          <PanGestureHandler
            ref={this.panGestureHandlerRef}
            onGestureEvent={this.onPanGestureEvent}
            onHandlerStateChange={this.onPanStateChange}
          >
            <Animated.View
              ref={this.containerRef}
              onLayout={this.onContainerLayout}
            >
              <AnimatedFlatList
                {...this.props}
                ref={this.flatlistRef}
                onContentSizeChange={this.onListContentSizeChange}
                scrollEnabled={!hoverComponent}
                renderItem={this.renderItem}
                extraData={this.state}
                keyExtractor={this.keyExtractor}
                onScroll={this.onScroll}
                scrollEventThrottle={1}
              />
              {!!hoverComponent && this.renderHoverComponent()}
            </Animated.View>
          </PanGestureHandler>
        </Animated.View>
      </TapGestureHandler>
    )
  }
}

export default DraggableFlatList

type RowItemProps = {
  move: (
    hoverComponent: React.ComponentType,
    index: number,
    itemKey: string,
  ) => void,
  index: number,
  item: any,
  renderItem: (item: any) => React.ComponentType
  itemKey: string
}

class RowItem extends React.PureComponent<RowItemProps> {

  move = () => {
    const { move, renderItem, item, index, itemKey } = this.props
    const hoverComponent = renderItem({
      isActive: true,
      item,
      index,
      move: () => console.log('## attempt to call move on hovering component'),
    })
    move(hoverComponent, index, itemKey)
  }

  render() {
    const { renderItem, item, index } = this.props
    return renderItem({
      isActive: false,
      item,
      index,
      move: this.move,
    })
  }
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  hoverComponentVertical: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
  hoverComponentHorizontal: {
    position: 'absolute',
    bottom: 0,
    top: 0,
  },
  wrapper: { flex: 1, opacity: 1 },
  fullOpacity: { opacity: 1 }
})