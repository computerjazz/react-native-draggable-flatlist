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
  extraData: null,
}

// Note using LayoutAnimation.easeInEaseOut() was causing blank spaces to
// show up in list: https://github.com/facebook/react-native/issues/13207
const layoutAnimConfig = {
  duration: 300,
  create: {
    type: LayoutAnimation.Types.easeInEaseOut,
    property: LayoutAnimation.Properties.scaleXY,
  },
  update: {
    type: LayoutAnimation.Types.easeInEaseOut,
    property: LayoutAnimation.Properties.scaleXY,
  }
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
  _releaseVal = null
  _releaseAnim = null

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
        if (this._releaseAnim) {
          return false
        }
        this._moveAnim.setValue(tappedPixel)
        this._move = tappedPixel

        // compensate for translucent or hidden StatusBar on android
        if (Platform.OS === 'android' && !horizontal) {
          const isTranslucent = StatusBar._propsStack.reduce(((acc, cur) => {
            return cur.translucent === undefined ? acc : cur.translucent
          }), false)

          const isHidden = StatusBar._propsStack.reduce(((acc, cur) => {
            return cur.hidden === null ? acc : cur.hidden.value
          }), false)

          this._androidStatusBarOffset = (isTranslucent || isHidden) ? StatusBar.currentHeight : 0
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
        if (activeRow === -1) return
        // If user flings row up and lets go in the middle of an animation measurements can error out. 
        // Give layout animations some time to complete and animate element into place before calling onMoveEnd

        // Spacers have different positioning depending on whether the spacer row is before or after the active row.
        // This is because the active row animates to height 0, so everything after it shifts upwards, but everything before
        // it shifts downward
        const isAfterActive = spacerIndex > activeRow
        const isLastElement = spacerIndex >= data.length
        const spacerElement = isLastElement ? lastElementMeasurements : spacerMeasurements
        if (!spacerElement) return
        const { x, y, width, height } = spacerElement
        const size = horizontal ? width : height
        const offset = horizontal ? x : y
        const pos = offset - this._scrollOffset + this._additionalOffset + (isLastElement ? size : 0)
        const activeItemSize = horizontal ? activeMeasurements.width : activeMeasurements.height
        this._releaseVal = pos - (isAfterActive ? activeItemSize : 0)
        if (this._releaseAnim) this._releaseAnim.stop()
        this._releaseAnim = Animated.spring(this._moveAnim, {
          toValue: this._releaseVal,
          stiffness: 5000,
          damping: 500,
          mass: 3,
          useNativeDriver: true,
        })

        this._releaseAnim.start(this.onReleaseAnimationEnd)
      }
    })
    this.state = initialState
  }

  onReleaseAnimationEnd = () => {
    const { data, onMoveEnd } = this.props
    const { activeRow, spacerIndex } = this.state
    const sortedData = this.getSortedList(data, activeRow, spacerIndex)
    const isAfterActive = spacerIndex > activeRow
    const from = activeRow
    const to = spacerIndex - (isAfterActive ? 1 : 0)
    this._moveAnim.setValue(this._releaseVal)
    this._spacerIndex = -1
    this._hasMoved = false
    this._move = 0
    this._releaseAnim = null
    this.setState(initialState, () => {
      onMoveEnd && onMoveEnd({
        row: data[activeRow],
        from,
        to,
        data: sortedData,
      })
    })
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
    const { scrollPercent, data, horizontal, scrollSpeed } = this.props
    const scrollRatio = scrollPercent / 100
    if (activeRow === -1) return
    const nextSpacerIndex = this.getSpacerIndex(this._move, activeRow)
    if (nextSpacerIndex > -1 && nextSpacerIndex !== this._spacerIndex) {
      LayoutAnimation.configureNext(layoutAnimConfig);
      this.setState({ spacerIndex: nextSpacerIndex })
      this._spacerIndex = nextSpacerIndex
      if (nextSpacerIndex === data.length) this._flatList.scrollToEnd()
    }

    // Scroll if hovering in top or bottom of container and have set a scroll %
    const isLastItem = (activeRow === data.length - 1) || nextSpacerIndex === data.length
    const isFirstItem = activeRow === 0
    if (this._measurements[activeRow]) {
      const rowSize = this._measurements[activeRow][horizontal ? 'width' : 'height']
      const hoverItemTopPosition = Math.max(0, this._move - (this._additionalOffset + this._containerOffset))
      const hoverItemBottomPosition = Math.min(this._containerSize, hoverItemTopPosition + rowSize)
      const fingerPosition = Math.max(0, this._move - this._containerOffset)
      const shouldScrollUp = !isFirstItem && fingerPosition < (this._containerSize * scrollRatio)
      const shouldScrollDown = !isLastItem && fingerPosition > (this._containerSize * (1 - scrollRatio))
      if (shouldScrollUp) this.scroll(-scrollSpeed, nextSpacerIndex)
      else if (shouldScrollDown) this.scroll(scrollSpeed, nextSpacerIndex)
    }

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

  measureItem = (index) => {
    const { activeRow } = this.state
    const { horizontal } = this.props
    // setTimeout required or else dimensions reported as 0
    !!this._refs[index] && setTimeout(() => {
      try {
        // Using stashed ref prevents measuring an unmounted componenet, which throws an error
        !!this._refs[index] && this._refs[index].measureInWindow(((x, y, width, height) => {
          if ((width || height) && activeRow === -1) {
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
        console.log('## measure error -- index: ', index, activeRow, this._refs[index], e)
      }
    }, 100)
  }

  move = (hoverComponent, index) => {
    const { onMoveBegin } = this.props
    if (this._releaseAnim) {
      this._releaseAnim.stop()
      this.onReleaseAnimationEnd()
      return
    }
    this._refs.forEach((ref, index) => this.measureItem(ref, index))
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

  setRef = index => (ref) => {
    if (!!ref) {
      this._refs[index] = ref
      this.measureItem(index)
    }
  }

  renderItem = ({ item, index }) => {
    const { renderItem, data, horizontal } = this.props
    const { activeRow, spacerIndex } = this.state
    const isActiveRow = activeRow === index
    const isSpacerRow = spacerIndex === index
    const isLastItem = index === data.length - 1
    const spacerAfterLastItem = spacerIndex >= data.length
    const activeRowSize = this._measurements[activeRow] ? this._measurements[activeRow][horizontal ? 'width' : 'height'] : 0
    const endPadding = (isLastItem && spacerAfterLastItem)
    const spacerStyle = { [horizontal ? 'width' : 'height']: activeRowSize }

    return (
      <View style={[styles.fullOpacity, { flexDirection: horizontal ? 'row' : 'column' }]} >
        {isSpacerRow && <View style={spacerStyle} />}
        <RowItem
          horizontal={horizontal}
          index={index}
          isActiveRow={isActiveRow}
          renderItem={renderItem}
          item={item}
          setRef={this.setRef}
          move={this.move}
          moveEnd={this.moveEnd}
          extraData={this.state.extraData}
        />
        {endPadding && <View style={spacerStyle} />}
      </View>
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

  measureContainer = event => {
    if (this.containerView) {
      const { horizontal } = this.props
      this.containerView.measure((x, y, width, height, pageX, pageY) => {
        this._containerOffset = horizontal ? pageX : pageY
        this._containerSize = horizontal ? width : height
      })      
    }
  }

  keyExtractor = (item, index) => `sortable-flatlist-item-${index}`

  componentDidUpdate = (prevProps, prevState) => {
    if (prevProps.extraData !== this.props.extraData) {
      this.setState({ extraData: this.props.extraData })
    }
  }

  onScroll = (props) => {
    const { onScroll, horizontal } = this.props
    this._scrollOffset = props.nativeEvent.contentOffset[horizontal ? 'x' : 'y']
    onScroll && onScroll(props)
  }

  render() {
    const { keyExtractor } = this.props

    return (
      <View
        ref={ref => {this.containerView = ref}}
        onLayout={this.measureContainer}
        {...this._panResponder.panHandlers}
        style={styles.wrapper} // Setting { opacity: 1 } fixes Android measurement bug: https://github.com/facebook/react-native/issues/18034#issuecomment-368417691
      >
        <FlatList
          {...this.props}
          scrollEnabled={this.state.activeRow === -1}
          ref={ref => this._flatList = ref}
          renderItem={this.renderItem}
          extraData={this.state}
          keyExtractor={keyExtractor || this.keyExtractor}
          onScroll={this.onScroll}
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
  scrollSpeed: 5,
  contentContainerStyle: {},
}

class RowItem extends React.PureComponent {

  move = () => {
    const { move, moveEnd, renderItem, item, index } = this.props
    const hoverComponent = renderItem({ isActive: true, item, index, move: () => null, moveEnd })
    move(hoverComponent, index)
  }

  render() {
    const { moveEnd, isActiveRow, horizontal, renderItem, item, index, setRef } = this.props
    const component = renderItem({
      isActive: false,
      item,
      index,
      move: this.move,
      moveEnd,
    })
    let wrapperStyle = { opacity: 1 }
    if (horizontal && isActiveRow) wrapperStyle = { width: 0, opacity: 0 }
    else if (!horizontal && isActiveRow) wrapperStyle = { height: 0, opacity: 0 }

    // Rendering the final row requires padding to be applied at the bottom
    return (
      <View ref={setRef(index)} collapsable={false} style={{ opacity: 1, flexDirection: horizontal ? 'row' : 'column' }}>
        <View style={wrapperStyle}>
          {component}
        </View>
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
  },
  wrapper: { flex: 1, opacity: 1 },
  fullOpacity: { opacity: 1 }
})