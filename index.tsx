import * as React from 'react'
import { PanGestureHandler, TapGestureHandler, State as GestureState, FlatList } from "react-native-gesture-handler"
import Reanimated from "react-native-reanimated"

const AnimatedFlatList = Reanimated.createAnimatedComponent(FlatList)

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
  lessThan,
  not,
} = Reanimated

import {
  View,
  StyleSheet,
  VirtualizedListProps,
} from 'react-native'

interface Props extends VirtualizedListProps<any> {
  horizontal: boolean,
  onMoveBegin?: (index: number) => void,
}

class DraggableFlatList extends React.Component<Props> {

  state = {
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

  hoverAnim = sub(this.touchAbs, this.touchCellOffset)
  scrollOffset = new Value(0)
  tappedRow = new Value(-1)
  activeRow = new Value(-1)
  spacerRow = new Value(-1)
  activeRowHeight = new Value(0)
  cellData = []


  setCellData = (data = []) => {
    data.forEach((d, i) => {
      this.cellData[i] = {
        ref: React.createRef(),
        opacity: cond(eq(this.activeRow, i), 0, 1),
        offset: 0,
        size: 0,
        tapGestureState: new Value(GestureState.UNDETERMINED),
        translateY: cond(
          and(
            neq(this.activeRow, -1),
            greaterThan(i, this.activeRow),
            not(lessThan(i, this.spacerRow)),
          ), this.activeRowHeight, 0)
      }
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
    this.activeRow.setValue(index)
    this.spacerRow.setValue(index)
    this.setState({
      activeRow: index,
      hoverComponent,
    }, () => onMoveBegin && onMoveBegin(index)
    )
  }

  moveEnd = () => {
    console.log("JS on move end!!")
    this.setState({
      activeRow: -1,
      hoverComponent: null,
    })
  }

  setRef = (index: number) => (ref) => {

  }

  measureCell = ([index]: number[]) => {
    const { horizontal } = this.props
    const { ref } = this.cellData[index]
    if (index === -1 || !(ref.current && ref.current._component)) {
      return
    }
    ref.current._component.measure((x, y, w, h, pageX, pageY) => {
      // console.log(`measure index ${index}: height ${h} pagey ${pageY}`)
      this.cellData[index].size = horizontal ? w : h
      this.cellData[index].offset = horizontal ? pageX : pageY
    })
  }

  renderItem = ({ item, index }) => {
    const { renderItem, horizontal } = this.props
    const { activeRow } = this.state
    const cellData = this.cellData[index]
    const { ref, translateY } = cellData
    return (
      <Reanimated.View
        onLayout={() => this.measureCell([index])}
        style={{
          transform: [{ translateY }],
        }}
      >
        <TapGestureHandler
          simultaneousHandlers={this.containerTapRef}
          onHandlerStateChange={event([{
            nativeEvent: ({ state, y }) => block([
              set(this.cellTapState, state),
              // debug('set cell tap', this.cellTapState),
              cond(eq(state, GestureState.BEGAN), [
                set(this.touchCellOffset, y),
                debug(`touch cell offset ${index}`, this.touchCellOffset),
              ]),
              cond(eq(state, GestureState.CANCELLED), [
                // debug('cancelled', this.cellTapState),
              ]),
              cond(eq(state, GestureState.END), [
                // debug('cell touch end', this.cellTapState),
                // call([this.cellTapState], this.moveEnd),
              ])
            ])
          }])}
        >
          <Reanimated.View
            ref={ref}
            style={{
              flex: 1,
              opacity: 0.5,
              flexDirection: horizontal ? 'row' : 'column',
            }}
          >
            {activeRow !== index && (
              <RowItem
                horizontal={horizontal}
                index={index}
                renderItem={renderItem}
                item={item}
                setRef={this.setRef}
                move={this.move}
                moveEnd={this.moveEnd}
              />
            )}
          </Reanimated.View>
        </TapGestureHandler>
      </Reanimated.View>
    )
  }

  renderHoverComponent = () => {
    const { hoverComponent } = this.state
    const { horizontal } = this.props
    return !!hoverComponent && (
      <Reanimated.View style={[
        styles[`hoverComponent${horizontal ? "Horizontal" : "Vertical"}`],
        {
          transform: [{
            [`translate${horizontal ? "X" : "Y"}`]: this.hoverAnim
          }]
        }]}
      >
        {hoverComponent}
      </Reanimated.View>
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
          [this.props.horizontal ? "x" : "y"]: offset => set(this.scrollOffset, offset)
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
            // debug('container tap begin', this.touchAbs),
          ]),
        cond(
          and(
            eq(state, GestureState.ACTIVE),
            neq(this.tapGestureState, GestureState.ACTIVE)
          ), [
            debug('container tap active', this.touchAbs),
          ]),
        set(this.tapGestureState, state),
      ])
    }
  ])

  onPanStateChange = event([
    {
      nativeEvent: ({ state }) => block([
        set(this.panGestureState, state),
        // debug('pan state change', this.panGestureState),
        cond(eq(state, GestureState.END), [
          debug('pan end', this.panGestureState),
          set(this.activeRow, -1),
          set(this.spacerRow, -1),
          call([this.panGestureState], this.moveEnd),
        ]),
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

        <Reanimated.View style={styles.flex}>
          <PanGestureHandler
            ref={this.containerPanRef}
            onGestureEvent={this.onPanGestureEvent}
            onHandlerStateChange={this.onPanStateChange}
          >
            <Reanimated.View
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

            </Reanimated.View>
          </PanGestureHandler>
        </Reanimated.View>
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

class RowItem extends React.PureComponent {

  move = () => {
    const { move, moveEnd, renderItem, item, index } = this.props
    const hoverComponent = renderItem({
      isActive: true,
      item,
      index,
      move: () => console.log('## attempt to call move on hovering component'),
      moveEnd
    })
    move(hoverComponent, index)
  }

  render() {
    const { moveEnd, renderItem, item, index } = this.props
    return renderItem({
      isActive: false,
      item,
      index,
      move: this.move,
      moveEnd,
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