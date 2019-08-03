import * as React from 'react'
import { findNodeHandle } from 'react-native'
import {
  PanGestureHandler,
  TapGestureHandler,
  State as GestureState,
  FlatList
} from "react-native-gesture-handler"
import Animated from "react-native-reanimated"

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList)

console.log("STATES", GestureState)

const {
  Value,
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
  interpolate,
  onChange,
  multiply,
  divide,
  greaterThan,
  greaterOrEq,
  lessThan,
  not,
  Clock,
  clockRunning,
  timing,
  startClock,
  stopClock,
  spring,
} = Animated

import {
  StyleSheet,
  VirtualizedListProps,
  Text,
} from 'react-native'

interface Props<T> extends VirtualizedListProps<T> {
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
  activeKey: string,
  hoverComponent: null | React.ComponentType,
}

type CellData = {
  measurements: {
    size: number,
    offset: number,
  },
  translate: Animated.Node<number>,
  currentIndex: Animated.Node<number>,
  onLayout: () => void,
}

// Run callback on next paint:
// https://stackoverflow.com/questions/26556436/react-after-render-code
function onNextFrame(callback) {
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
  containerTapRef = React.createRef()

  containerOffset = new Value(0)

  touchAbsolute = new Value(0)
  touchCellOffset = new Value(0)
  panGestureState = new Value(0)
  tapGestureState = new Value(0)
  cellTapState = new Value(0)
  hasMoved = new Value(0)
  disabled = new Value(0)

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
    toValue: new Value(0),
    restSpeedThreshold: 0.2,
    restDisplacementThreshold: 0.2,
  }

  activeIndex = new Value<number>(-1)
  isHovering = greaterThan(this.activeIndex, -1)

  spacerIndex = new Value<number>(-1)
  activeRowSize = new Value<number>(0)

  scrollOffset = new Value<number>(0)
  hoverAnim = sub(this.touchAbsolute, this.touchCellOffset, this.containerOffset)
  hoverMid = add(this.hoverAnim, divide(this.activeRowSize, 2))
  hoverOffset = add(this.hoverAnim, this.scrollOffset)

  cellAnim = new Map<string, {
    config: Animated.SpringConfig,
    state: Animated.SpringState,
    clock: Animated.Clock,
  }>()
  cellData = new Map<string, CellData>()
  cellRefs = new Map<string, React.RefObject<typeof Animated.View>>()
  offsets = new Map<string, Animated.Node<number>>()
  sizes = new Map<string, Animated.Node<number>>()

  moveEndParams = [this.activeIndex, this.spacerIndex]

  setCellData = (data: T[] = []) => {
    console.log('set cell data!!')
    data.forEach((item, index) => {
      const key = this.keyExtractor(item, index)
      const cell = this.cellData.get(key)

      if (cell) {
        // If key is already instantiated, all
        // we need to do is update its index
        return cell.currentIndex.setValue(index)
      }

      const currentIndex = new Value(index)

      if (!this.cellAnim.get(key)) {
        console.log('creat anim for', key)
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
      }

      const { clock, config, state } = this.cellAnim.get(key)

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

      let offset = this.offsets.get(key)
      if (!offset) {
        offset = new Value(0)
        this.offsets.set(key, offset)
      }

      let size = this.sizes.get(key)
      if (!size) {
        size = new Value(0)
        this.sizes.set(key, size)
      }

      const midpoint = add(offset, divide(size, 2))
      const isAfterActive = greaterThan(currentIndex, this.activeIndex)

      const hoverMid = cond(
        isAfterActive,
        sub(midpoint, this.activeRowSize),
        midpoint,
      )
      const isAfterHoverMid = greaterOrEq(hoverMid, this.hoverOffset)

      const translate = cond(and(
        this.isHovering,
        neq(currentIndex, this.activeIndex)
      ), cond(isAfterHoverMid, this.activeRowSize, 0), 0)

      const onChangeTranslate = onChange(translate, [
        cond(not(this.hasMoved), set(state.position, translate)),
        cond(this.isHovering, [
          or(
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
            )
          ),
          set(config.toValue, translate),
          startClock(clock),
        ]),
      ])

      const animateTo = cond(isAfterActive, [
        sub(sub(add(offset, size), this.activeRowSize), this.scrollOffset)
      ], [
          sub(offset, this.scrollOffset)
        ])

      const onChangeSpacerIndex = onChange(this.spacerIndex, [
        cond(eq(this.spacerIndex, currentIndex), [
          set(this.hoverAnimConfig.toValue, animateTo),
        ]),
      ])

      const cellData = {
        currentIndex,
        onLayout: async () => {
          console.log('on layout', key)
          if (this.state.activeKey !== key) {
            this.measureCell(key)
          }
        },
        measurements: {
          size: 0,
          offset: 0,
        },
        translate: block([
          onChangeTranslate,
          onChangeSpacerIndex,
          cond(this.hasMoved, cond(this.isHovering, runClock, 0), translate)
        ]),
      }
      this.cellData.set(key, cellData)
    })
  }

  static getDerivedStateFromProps(props) {
    return {
      extraData: props.extraData
    }
  }

  constructor(props) {
    super(props)
    this.setCellData(props.data)
  }

  componentDidUpdate = async (prevProps) => {
    if (prevProps.data !== this.props.data) {
      // Remeasure on next paint  
      this.setCellData(this.props.data)
      onNextFrame(this.flushQueue)
      this.disabled.setValue(0)
    }
  }

  queue: (() => Promise<void>[])[] = []
  flushQueue = async () => {
    for (let fn of this.queue) {
      await Promise.all(fn())
    }
    this.queue = []
  }

  move = (hoverComponent, index, activeKey) => {
    const { onMoveBegin } = this.props
    console.log('setting active row!!', index)

    const setActiveItem = () => {
      this.activeIndex.setValue(index)
      this.activeRowSize.setValue(this.sizes.get(activeKey))

      this.setState({
        activeKey,
        hoverComponent,
      }, () => onMoveBegin && onMoveBegin(index)
      )
    }

    if (this.state.hoverComponent) {
      // We can't move more than one row at a time
      // TODO: Put action on queue
      console.log("## Can't set multiple active items")

    } else setActiveItem()


  }

  onRelease = ([index]) => {
    const { onRelease } = this.props
    console.log('on release', index)
    onRelease && onRelease(index)
  }


  onMoveEnd = ([from, to]) => {
    console.log("OME Begin!!", from, to)
    const { onMoveEnd } = this.props
    if (onMoveEnd) {
      const { data } = this.props
      let newData = [...data]
      if (from !== to) {
        newData.splice(from, 1)
        newData.splice(to, 0, data[from])
      }

      onMoveEnd({
        from,
        to,
        data: newData,
      })
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
        this.sizes.get(key).setValue(size)
        this.offsets.get(key).setValue(offset)
        cellData.measurements.size = size
        cellData.measurements.offset = offset
        resolve()
      });
    })
  }

  renderItem = ({ item, index }) => {
    const { renderItem, horizontal, data } = this.props
    const { activeKey } = this.state
    const key = this.keyExtractor(item, index)

    const { translate, onLayout, measurements } = this.cellData.get(key)
    const transform = [{ [`translate${horizontal ? 'X' : 'Y'}`]: translate }]
    let ref = this.cellRefs.get(key)
    if (!ref) {
      ref = React.createRef()
      this.cellRefs.set(key, ref)
    }

    const isActiveRow = activeKey === key
    const isLast = index === data.length - 1
    const activeCellData = this.cellData.get(activeKey)

    return (
      <>
        <Animated.View
          pointerEvents={activeKey ? "none" : "audo"}
          onLayout={onLayout}
          style={{
            flex: 1,
            transform,
            flexDirection: horizontal ? 'row' : 'column',
          }}
        >
          <TapGestureHandler
            simultaneousHandlers={this.containerTapRef}
            onHandlerStateChange={this.onCellTap}
          >
            <Animated.View
              ref={ref}
              style={{
                flex: 1,
                [horizontal ? "width" : "height"]: isActiveRow ? 0 : undefined,
                opacity: isActiveRow ? 0 : 1
              }}
            >
              <RowItem
                itemKey={key}
                index={index}
                renderItem={renderItem}
                item={item}
                move={this.move}
              />
              <Animated.View style={{
                position: 'absolute',
                top: 0,
                left: 0,
              }}>
                <Text style={{ color: 'white' }}>{`index: ${index}`}</Text>
                <Text style={{ color: 'white' }}>{`key: ${key}`}</Text>
                <Text style={{ color: 'white' }}>{`size: ${measurements.size}`}</Text>
                <Text style={{ color: 'white' }}>{`offset: ${measurements.offset}`}</Text>
              </Animated.View>
            </Animated.View>
          </TapGestureHandler>
        </Animated.View>
        {isLast && activeCellData ? (
          <Animated.View
            style={{
              opacity: 0,
              height: activeCellData.measurements.size  // We removed the active cell from the list height when it became active, so we need to add its height to the end of the list 
            }}
          />
        ) : null}
      </>
    )
  }

  renderHoverComponent = () => {
    const { hoverComponent } = this.state
    const { horizontal } = this.props

    const resetSpring = [
      set(this.hoverAnimState.time, 0),
      set(this.hoverAnimState.position, this.hoverAnimConfig.toValue),
      set(this.hoverAnimState.finished, 0),
      set(this.hoverAnimState.velocity, 0),
    ]

    const runClock = cond(clockRunning(this.hoverClock), [
      spring(this.hoverClock, this.hoverAnimState, this.hoverAnimConfig),
      cond(eq(this.hoverAnimState.finished, 1), [
        resetSpring,
        stopClock(this.hoverClock),
        debug('calling onMoveEnd for index', this.activeIndex),
        call(this.moveEndParams, this.onMoveEnd),
        set(this.hasMoved, 0),
      ]),
      this.hoverAnimState.position
    ])

    return !!hoverComponent && (
      <Animated.View style={[
        styles[`hoverComponent${horizontal ? "Horizontal" : "Vertical"}`],
        {
          transform: [{
            [`translate${horizontal ? "X" : "Y"}`]: block([
              cond(clockRunning(this.hoverClock), [
                runClock,
              ], this.hoverAnim)
            ])
          }]
        }]}
      >
        {hoverComponent}
      </Animated.View>
    )
  }

  keyExtractor = (item, index) => {
    if (this.props.keyExtractor) return this.props.keyExtractor(item, index)
    else return `draggable-flatlist-item-${index}`
  }

  onContainerLayout = () => {
    const { horizontal } = this.props
    this.containerRef.current._component.measure((x, y, w, h, pageX, pageY) => {
      console.log('setContaineroOffset', horizontal ? pageX : pageY)
      this.containerOffset.setValue(horizontal ? pageX : pageY)
    })
  }

  onCellTap = event([{
    nativeEvent: ({ state, y, x }) => block([
      cond(
        neq(state, this.cellTapState), [
          cond(eq(state, GestureState.BEGAN), [
            set(this.touchCellOffset, this.props.horizontal ? x : y),
            debug(`touch cell offset`, this.touchCellOffset),
          ]),
          cond(eq(state, GestureState.END), [
            debug('cell touch end', this.cellTapState),
            set(this.disabled, 1),
            call([this.activeIndex], this.onRelease),
            call(this.moveEndParams, this.onMoveEnd),
            set(this.hasMoved, 0),
          ]),
          set(this.cellTapState, state),
        ]
      ),
    ])
  }])

  onScroll = event([
    {
      nativeEvent: {
        contentOffset: {
          [this.props.horizontal ? "x" : "y"]: this.scrollOffset,
        }
      }
    }
  ])

  onTapStateChange = event([
    {
      nativeEvent: ({ state, absoluteY, absoluteX }) => block([
        cond(
          and(
            not(this.disabled),
            eq(state, GestureState.BEGAN),
            neq(this.tapGestureState, GestureState.BEGAN)
          ), [
            set(this.touchAbsolute, this.props.horizontal ? absoluteX : absoluteY),
            debug('container tap begin', this.touchAbsolute),
          ]),
        set(this.tapGestureState, state),
      ])
    }
  ])

  onPanStateChange = event([
    {
      nativeEvent: ({ state }) => block([
        cond(and(
          eq(state, GestureState.END),
          neq(this.panGestureState, GestureState.END),
        ), [
            set(this.disabled, 1),
            debug('disabling!!', this.disabled),
            set(this.hoverAnimState.position, this.hoverAnim),
            startClock(this.hoverClock),
            call([this.activeIndex], this.onRelease),
          ]),
        set(this.panGestureState, state),
      ])
    }
  ])

  onPanGestureEvent = event([
    {
      nativeEvent: ({ absoluteY, absoluteX }) => block([
        cond(and(
          eq(this.panGestureState, GestureState.ACTIVE),
          not(this.disabled),
        ), [
            cond(not(this.hasMoved), set(this.hasMoved, 1)),
            set(this.touchAbsolute, this.props.horizontal ? absoluteX : absoluteY),
          ])
      ]),
    },
  ])

  render() {
    const { hoverComponent } = this.state
    return (
      <TapGestureHandler
        ref={this.containerTapRef}
        onHandlerStateChange={this.onTapStateChange}
      >
        <Animated.View style={styles.flex}>
          <PanGestureHandler
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
                scrollEnabled={!hoverComponent}
                renderItem={this.renderItem}
                extraData={this.state}
                keyExtractor={this.keyExtractor}
                onScroll={this.onScroll}
                scrollEventThrottle={16}
              />
              {this.renderHoverComponent()}
            </Animated.View>
          </PanGestureHandler>
        </Animated.View>
      </TapGestureHandler>
    )
  }
}

export default DraggableFlatList

DraggableFlatList.defaultProps = {
  scrollPercent: 5,
  scrollSpeed: 5,
  contentContainerStyle: {},
}

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