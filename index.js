import React, { Component, PureComponent } from 'react'
import {
  LayoutAnimation,
  YellowBox,
  Animated,
  FlatList,
  View,
  PanResponder,
  Platform,
  UIManager,
  StatusBar,
  StyleSheet,
} from 'react-native'

// Measure function triggers false positives
YellowBox.ignoreWarnings(['Warning: isMounted(...) is deprecated'])
UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true);

const initialState = {
  activeRow: -1,
  showHoverComponent: false,
  spacerIndex: -1,
  scroll: false,
  hoverComponent: null,
}

class SortableFlatList extends Component {
  _moveAnim = new Animated.Value(0)
  _offset = new Animated.Value(0)
  _hoverAnim = Animated.add(this._moveAnim, this._offset)
  _spacerIndex = -1
  _pixels = []
  _measurements = []
  _scrollOffset = 0
  _containerSize
  _containerOffset
  _move = 0
  _hasMoved = false
  _refs = []
  _additionalOffset = 0
  _androidStatusBarOffset = 0

  constructor(props) {
    super(props)
    this._panResponder = PanResponder.create({
      onStartShouldSetPanResponderCapture: (evt, gestureState) => {
        const { pageX, pageY } = evt.nativeEvent
        const { horizontal } = this.props
        const tappedPixel = horizontal ? pageX : pageY
        const tappedRow = this._pixels[Math.floor(this._scrollOffset + tappedPixel)]
        if (tappedRow === undefined) return false
        this._additionalOffset = (tappedPixel + this._scrollOffset) - this._measurements[tappedRow][horizontal ? 'x' : 'y']
        this._moveAnim.setValue(tappedPixel)
        this._move = tappedPixel

        // compensate for translucent StatusBar on android
        if (Platform.OS === 'android' && !horizontal) {
          const isTranslucent = StatusBar._propsStack.reduce(((acc, cur) => {
            return cur.translucent === undefined ? acc : cur.translucent
          }), false)
          this._androidStatusBarOffset = isTranslucent ? StatusBar.currentHeight : 0
        }
        this._offset.setValue((this._additionalOffset + this._containerOffset - this._androidStatusBarOffset) * -1)
        return false
      },
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        const { activeRow } = this.state
        const { horizontal } = this.props
        const { moveX, moveY } = gestureState
        const move = horizontal ? moveX : moveY
        const shouldSet = activeRow > -1
        this._moveAnim.setValue(move)
        if (shouldSet) {
          this.setState({ showHoverComponent: true })
          // Kick off recursive row animation
          this.animate()
          this._hasMoved = true
        }
        return shouldSet;
      },
      onPanResponderMove: Animated.event([null, { [props.horizontal ? 'moveX' : 'moveY']: this._moveAnim }], {
        listener: (evt, gestureState) => {
          const { moveX, moveY } = gestureState
          const { horizontal } = this.props
          this._move = horizontal ? moveX : moveY
        }
      }),
      onPanResponderTerminationRequest: ({ nativeEvent }, gestureState) => false,
      onPanResponderRelease: () => {
        const { activeRow, spacerIndex } = this.state
        const { data, horizontal } = this.props
        const activeMeasurements = this._measurements[activeRow]
        const spacerMeasurements = this._measurements[spacerIndex]
        const lastElementMeasurements = this._measurements[data.length - 1]
        const sortedData = this.getSortedList(data, activeRow, spacerIndex)

        // If user flings row up and lets go in the middle of an animation measurements can error out. 
        // Give layout animations some time to complete and animate element into place before calling onMoveEnd

        // Spacers have different positioning depending on whether the spacer row is before or after the active row.
        // This is because the active row animates to height 0, so everything after it shifts upwards, but everything before
        // it shifts downward
        const isAfterActive = spacerIndex > activeRow
        const isLastElement = spacerIndex >= data.length
        const spacerElement = isLastElement ? lastElementMeasurements : spacerMeasurements
        const { x, y, width, height } = spacerElement
        const size = horizontal ? width : height
        const offset = horizontal ? x : y
        const pos = offset - this._scrollOffset + this._additionalOffset + (isLastElement ? size : 0)
        const activeItemSize = horizontal ? activeMeasurements.width : activeMeasurements.height


        Animated.spring(this._moveAnim, {
          toValue: pos - (isAfterActive ? activeItemSize : 0),
          stiffness: 1000,
          damping: 500,
          mass: 3,
          useNativeDriver: true,
        }).start((() => {
          this._spacerIndex = -1
          this.setState(initialState)
          this._hasMoved = false
          this._move = 0
          this.props.onMoveEnd && this.props.onMoveEnd({
            row: this.props.data[activeRow],
            from: activeRow,
            to: spacerIndex - (isAfterActive ? 1 : 0),
            data: sortedData,
          })
        }))
      }
    })
    this.state = initialState
  }

  getSortedList = (data, activeRow, spacerIndex) => {
    if (activeRow === spacerIndex) return data
    const sortedData = data.reduce((acc, cur, i, arr) => {
      if (i === activeRow) return acc
      else if (i === spacerIndex) {
        acc = [...acc, arr[activeRow], cur]
      } else acc.push(cur)
      return acc
    }, [])
    if (spacerIndex >= data.length) sortedData.push(data[activeRow])
    return sortedData
  }

  animate = () => {
    const { activeRow } = this.state
    const { scrollPercent, data, horizontal } = this.props
    const scrollRatio = scrollPercent / 100
    if (activeRow === -1) return
    const nextSpacerIndex = this.getSpacerIndex(this._move, activeRow)
    if (nextSpacerIndex > -1 && nextSpacerIndex !== this._spacerIndex) {
      LayoutAnimation.easeInEaseOut()
      this.setState({ spacerIndex: nextSpacerIndex })
      this._spacerIndex = nextSpacerIndex
      if (nextSpacerIndex === data.length) this._flatList.scrollToEnd()
    }

    // Scroll if hovering in top or bottom of container and have set a scroll %
    const isLastItem = (activeRow === data.length - 1) || nextSpacerIndex === data.length
    const isFirstItem = activeRow === 0

    const rowSize = horizontal ? this._measurements[activeRow].width : this._measurements[activeRow].height
    const hoverItemTopPosition = Math.max(0, this._move - (this._additionalOffset + this._containerOffset))
    const hoverItemBottomPosition = Math.min(this._containerSize, hoverItemTopPosition + rowSize)
    const fingerPosition = Math.max(0, this._move - this._containerOffset)
    const shouldScrollUp = !isFirstItem && fingerPosition < (this._containerSize * scrollRatio)
    const shouldScrollDown = !isLastItem && fingerPosition > (this._containerSize * (1 - scrollRatio))
    if (shouldScrollUp) this.scroll(-5, nextSpacerIndex)
    else if (shouldScrollDown) this.scroll(5, nextSpacerIndex)

    requestAnimationFrame(this.animate)
  }

  scroll = (scrollAmt, spacerIndex) => {
    if (spacerIndex >= this.props.data.length) return this._flatList.scrollToEnd()
    if (spacerIndex === -1) return
    const currentScrollOffset = this._scrollOffset
    const newOffset = currentScrollOffset + scrollAmt
    const offset = Math.max(0, newOffset)
    this._flatList.scrollToOffset({ offset, animated: false })
  }


  getSpacerIndex = (move, activeRow) => {
    const { horizontal } = this.props
    if (activeRow === -1 || !this._measurements[activeRow]) return -1
    // Find the row that contains the midpoint of the hovering item
    const hoverItemSize = this._measurements[activeRow][horizontal ? 'width' : 'height']
    const hoverItemMidpoint = move - this._additionalOffset + hoverItemSize / 2
    const hoverPoint = Math.floor(hoverItemMidpoint + this._scrollOffset)
    let spacerIndex = this._pixels[hoverPoint]
    if (spacerIndex === undefined) {
      // Fallback in case we can't find index in _pixels array
      spacerIndex = this._measurements.findIndex(({ width, height, x, y }) => {
        const itemOffset = horizontal ? x : y
        const itemSize = horizontal ? width : height
        return hoverPoint > itemOffset && hoverPoint < (itemOffset + itemSize)
      })
    }
    // Spacer index differs according to placement. See note in onPanResponderRelease
    return spacerIndex > activeRow ? spacerIndex + 1 : spacerIndex
  }

  measureItem = (ref, index) => {
    this._refs[index] = ref
    const { activeRow } = this.state
    const { horizontal } = this.props
    // setTimeout required or else dimensions reported as 0
    !!ref && setTimeout(() => {
      try {
        // Using stashed ref prevents measuring an unmounted componenet, which throws an error
        this._refs[index].measureInWindow(((x, y, width, height) => {
          if (y >= 0 && (width || height) && activeRow === -1) {
            const ypos = y + this._scrollOffset
            const xpos = x + this._scrollOffset
            const pos = horizontal ? xpos : ypos
            const size = horizontal ? width : height
            const rowMeasurements = { y: ypos, x: xpos, width, height }
            this._measurements[index] = rowMeasurements
            for (let i = Math.floor(pos); i < pos + size; i++) {
              this._pixels[i] = index
            }
          }
        }))
      } catch (e) {
        console.log('## measure error -- index: ', index, activeRow, ref, e)
      }
    }, 100)
  }

  move = (hoverComponent, index) => {
    const { onMoveBegin } = this.props
    this._spacerIndex = index
    this.setState({
      activeRow: index,
      spacerIndex: index,
      hoverComponent,
    }, () => onMoveBegin && onMoveBegin(index)
    )
  }

  moveEnd = () => {
    if (!this._hasMoved) this.setState(initialState)
  }

  setRef = index => (ref) => this.measureItem(ref, index)

  renderItem = ({ item, index }) => {
    const { renderItem, data, horizontal } = this.props
    const { activeRow, spacerIndex } = this.state
    const isSpacerRow = spacerIndex === index
    const spacerSize = (isSpacerRow && this._measurements[activeRow]) ? this._measurements[activeRow][horizontal ? 'width' : 'height'] : 0
    const endPadding = index === data.length - 1 && spacerIndex === data.length && this._measurements[activeRow][horizontal ? 'width' : 'height']
    return (
      <RowItem
        horizontal={horizontal}
        index={index}
        isActiveRow={activeRow === index}
        spacerSize={spacerSize}
        renderItem={renderItem}
        item={item}
        setRef={this.setRef}
        move={this.move}
        moveEnd={this.moveEnd}
        endPadding={endPadding}
      />
    )
  }

  renderHoverComponent = () => {
    const { hoverComponent } = this.state
    const { horizontal } = this.props
    return !!hoverComponent && (
      <Animated.View style={[
        horizontal ? styles.hoverComponentHorizontal : styles.hoverComponentVertical,
        { transform: [horizontal ? { translateX: this._hoverAnim } : { translateY: this._hoverAnim }] }]} >
        {hoverComponent}
      </Animated.View>
    )
  }

  measureContainer = ref => {
    if (ref && this._containerOffset === undefined) {
      // setTimeout required or else dimensions reported as 0
      setTimeout(() => {
        const { horizontal } = this.props
        ref.measure((x, y, width, height, pageX, pageY) => {
          this._containerOffset = horizontal ? pageX : pageY
          this._containerSize = horizontal ? width : height
        })
      }, 50)
    }
  }

  keyExtractor = (item, index) => `sortable-flatlist-item-${index}`

  render() {
    const { horizontal, keyExtractor } = this.props
    return (
      <View
        onLayout={e => console.log('layout', e.nativeEvent)}
        ref={this.measureContainer}
        {...this._panResponder.panHandlers}
        style={{ flex: 1, opacity: 1 }} // Setting { opacity: 1 } fixes Android measurement bug: https://github.com/facebook/react-native/issues/18034#issuecomment-368417691
      >
        <FlatList
          {...this.props}
          scrollEnabled={this.state.activeRow === -1}
          ref={ref => this._flatList = ref}
          renderItem={this.renderItem}
          extraData={this.state}
          keyExtractor={keyExtractor || this.keyExtractor}
          onScroll={({ nativeEvent }) => this._scrollOffset = nativeEvent.contentOffset[horizontal ? 'x' : 'y']}
          scrollEventThrottle={16}
        />
        {this.renderHoverComponent()}
      </View>
    )
  }
}

export default SortableFlatList

SortableFlatList.defaultProps = {
  scrollPercent: 5,
  contentContainerStyle: {},
}

class RowItem extends PureComponent {

  renderSpacer = (size) => <View style={this.props.horizontal ? { width: size } : { height: size }} />

  move = () => {
    const { move, moveEnd, renderItem, item, index } = this.props
    const hoverComponent = renderItem({ isActive: true, item, index, move: () => null, moveEnd })
    move(hoverComponent, index)
  }

  render() {
    const { moveEnd, isActiveRow, horizontal, endPadding, spacerSize, renderItem, item, index, setRef } = this.props
    const component = renderItem({
      isActive: false,
      item,
      index,
      move: this.move,
      moveEnd,
    })

    // Rendering the final row requires padding to be applied at the bottom
    return (
      <View ref={setRef(index)} style={{ opacity: 1, flexDirection: horizontal ? 'row' : 'column' }}>
        {!!spacerSize && this.renderSpacer(spacerSize)}
        <View style={[
          horizontal ? { width: isActiveRow ? 0 : undefined } : { height: isActiveRow ? 0 : undefined },
          { opacity: isActiveRow ? 0 : 1, overflow: 'hidden' }
        ]}>
          {component}
        </View>
        {!!endPadding && this.renderSpacer(endPadding)}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  hoverComponentVertical: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
  hoverComponentHorizontal: {
    position: 'absolute',
    bottom: 0,
    top: 0,
  }
})