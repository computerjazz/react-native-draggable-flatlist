import * as React from 'react'
import { PanGestureHandler, TapGestureHandler, State as GestureState, FlatList } from "react-native-gesture-handler"
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
} = Animated

import {
  StyleSheet,
  VirtualizedListProps,
} from 'react-native'

interface Props<T> extends VirtualizedListProps<T> {
  horizontal: boolean,
  onMoveBegin?: (index: number) => void,
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
  activeRowIndex: number,
  hoverComponent: null | React.ComponentType,
}

class DraggableFlatList<T> extends React.Component<Props<T>, State> {

  state = {
    activeRowIndex: -1,
    toRowIndex: -1,
    hoverComponent: null,
  }

  containerRef = React.createRef()
  flatlistRef = React.createRef()
  containerTapRef = React.createRef()
  containerPanRef = React.createRef()

  touchAbs = new Value(0)
  touchCellOffset = new Value(0)
  panGestureState = new Value(0)
  tapGestureState = new Value(0)
  cellTapState = new Value(0)

  activeRowIndex = new Value(-1)
  isHovering = greaterThan(this.activeRowIndex, -1)

  spacerIndex = new Value(-1)
  activeRowSize = new Value(0)


  scrollOffset = new Value(0)
  hoverAnim = sub(this.touchAbs, this.touchCellOffset)
  hoverMid = add(this.hoverAnim, divide(this.activeRowSize, 2))
  hoverOffset = add(this.hoverAnim, this.scrollOffset)

  cellData = []
  moveEndParams = [this.activeRowIndex, this.spacerIndex]

  setCellData = (data = []) => {
    data.forEach((d, index) => {
      const offset = new Value(0)
      const size = new Value(0)
      const midpoint = add(offset, divide(size, 2))

      const isAfterActive = greaterThan(index, this.activeRowIndex)

      const hoverMid = cond(
        isAfterActive,
        sub(midpoint, this.activeRowSize),
        midpoint,
      )

      const translateY = cond(
        and(
          this.isHovering,
          neq(index, this.activeRowIndex),
        ),
        cond(
          greaterOrEq(hoverMid, this.hoverOffset),
          this.activeRowSize,
          0),
        0,
      )

      const onChangeTranslate = onChange(translateY,
        cond(this.isHovering, [
          or(
            cond(and(
              not(isAfterActive),
              greaterThan(translateY, 0)
            ),
              set(this.spacerIndex, index)
            ),
            cond(and(
              not(isAfterActive),
              eq(translateY, 0),
            ),
              set(this.spacerIndex, index + 1)
            ),
            cond(and(
              isAfterActive,
              eq(translateY, 0),
            ),
              set(this.spacerIndex, index),
            ),
            cond(and(
              isAfterActive,
              greaterThan(translateY, 0),
            ),
              set(this.spacerIndex, index - 1)
            )
          ),
          debug('onCHange spacer inde', this.spacerIndex),
        ]
        ),
      )

      const cellData = {
        ref: React.createRef(),
        offset,
        size,
        translateY: block([
          onChangeTranslate,
          translateY,
        ]),
        tapGestureState: new Value(GestureState.UNDETERMINED),
      }

      this.cellData[index] = cellData
    })
  }

  constructor(props) {
    super(props)
    this.setCellData(props.data)
  }

  componentDidUpdate(prevProps) {
    if (prevProps.data !== this.props.data) {
      this.setCellData(this.props.data)
    }
  }

  move = (hoverComponent, index) => {
    const { onMoveBegin } = this.props
    console.log('setting active row!!', index)

    this.activeRowIndex.setValue(index)
    this.activeRowSize.setValue(this.cellData[index].size)

    this.setState({
      activeRowIndex: index,
      hoverComponent,
    }, () => onMoveBegin && onMoveBegin(index)
    )
  }

  onMoveEnd = ([from, to]) => {
    console.log("JS on move end!!", from, to)
    const { onMoveEnd } = this.props
    if (onMoveEnd) {
      const { data } = this.props
      let newData = data
      if (from !== to) {
        newData = [...data]
        newData.splice(from, 1)
        newData.splice(to, 0, data[from])
      }

      onMoveEnd({
        from,
        to,
        data: newData,
      })
    }
    this.setState({
      activeRowIndex: -1,
      hoverComponent: null,
    })
  }

  measureCell = ([index]: number[]) => {
    const { horizontal } = this.props
    const { ref } = this.cellData[index]
    if (index === -1 || !(ref.current && ref.current._component)) {
      return
    }
    ref.current._component.measure((x, y, w, h, pageX, pageY) => {
      // console.log(`measure index ${index}: height ${h} pagey ${pageY}`)
      this.cellData[index].size.setValue(horizontal ? w : h)
      this.cellData[index].offset.setValue(horizontal ? pageX : pageY)
    })
  }

  onCellTap = event([{
    nativeEvent: ({ state, y }) => block([
      cond(
        neq(state, this.cellTapState), [
          cond(eq(state, GestureState.BEGAN), [
            set(this.touchCellOffset, y),
            debug(`touch cell offset`, this.touchCellOffset),
          ]),
          cond(eq(state, GestureState.END), [
            debug('cell touch end', this.cellTapState),
            call(this.moveEndParams, this.onMoveEnd),
            set(this.activeRowIndex, -1),
            set(this.spacerIndex, -1),
          ]),
          set(this.cellTapState, state),
        ]
      ),
    ])
  }])

  renderItem = ({ item, index }) => {
    const { renderItem, horizontal } = this.props
    const { activeRowIndex } = this.state
    const cellData = this.cellData[index]
    const { ref, translateY } = cellData
    return (
      <Animated.View
        onLayout={() => this.measureCell([index])}
        style={{
          transform: [{ translateY }],
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
              opacity: 0.5,
              flexDirection: horizontal ? 'row' : 'column',
            }}
          >
            {activeRowIndex !== index && (
              <RowItem
                horizontal={horizontal}
                index={index}
                renderItem={renderItem}
                item={item}
                move={this.move}
              />
            )}
          </Animated.View>
        </TapGestureHandler>
      </Animated.View>
    )
  }

  renderHoverComponent = () => {
    const { hoverComponent } = this.state
    const { horizontal } = this.props
    return !!hoverComponent && (
      <Animated.View style={[
        styles[`hoverComponent${horizontal ? "Horizontal" : "Vertical"}`],
        {
          transform: [{
            [`translate${horizontal ? "X" : "Y"}`]: this.hoverAnim
          }]
        }]}
      >
        {hoverComponent}
      </Animated.View>
    )
  }

  keyExtractor = (item, index) => `draggable-flatlist-item-${index}`

  componentDidUpdate = (prevProps: Props) => {
    if (prevProps.extraData !== this.props.extraData) {
      this.setState({ extraData: this.props.extraData })
    }
  }

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
      nativeEvent: ({ state, absoluteY }) => block([
        cond(
          and(
            eq(state, GestureState.BEGAN),
            neq(this.tapGestureState, GestureState.BEGAN)
          ), [
            set(this.touchAbs, absoluteY),
            debug('container tap begin', this.touchAbs),
          ]),
        cond(
          and(
            eq(state, GestureState.FAILED),
            neq(this.tapGestureState, GestureState.FAILED)
          ), [
            debug('container tap fail', this.touchAbs),
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
            call(this.moveEndParams, this.onMoveEnd),
            set(this.activeRowIndex, -1),
            set(this.spacerIndex, -1),
          ]),
        set(this.panGestureState, state),
      ])
    }
  ])

  onPanGestureEvent = event([
    {
      nativeEvent: ({ absoluteY }) => block([
        set(this.touchAbs, absoluteY),
        // debug('pan evt', this.touchAbs),
      ]),
    },
  ])

  render() {
    const { horizontal, keyExtractor, data } = this.props
    const { hoverComponent } = this.state

    return (
      <TapGestureHandler
        ref={this.containerTapRef}
        onHandlerStateChange={this.onTapStateChange}
      >
        <Animated.View style={styles.flex}>
          <PanGestureHandler
            ref={this.containerPanRef}
            onGestureEvent={this.onPanGestureEvent}
            onHandlerStateChange={this.onPanStateChange}
          >
            <Animated.View
              ref={this.containerRef}
            >
              <AnimatedFlatList
                {...this.props}
                ref={this.flatlistRef}
                scrollEnabled={!hoverComponent}
                renderItem={this.renderItem}
                extraData={this.state}
                keyExtractor={keyExtractor || this.keyExtractor}
                onScroll={this.onScroll}
                scrollEventThrottle={1}
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
  move: (hoverComponent: React.ComponentType, index: number) => void,
  index: number,
  item: any,
  renderItem: (item: any) => React.ComponentType
}

class RowItem extends React.PureComponent<RowItemProps> {

  move = () => {
    const { move, renderItem, item, index } = this.props
    const hoverComponent = renderItem({
      isActive: true,
      item,
      index,
      move: () => console.log('## attempt to call move on hovering component'),
    })
    move(hoverComponent, index)
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