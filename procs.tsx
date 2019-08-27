import Animated from "react-native-reanimated"
import { State as GestureState } from "react-native-gesture-handler"

let {
  set,
  cond,
  add,
  sub,
  block,
  eq,
  neq,
  and,
  divide,
  greaterThan,
  greaterOrEq,
  not,
  proc,
  onChange,
  debug,
  call,
} = Animated

if (!proc) {
  console.warn("Use reanimated > 1.3 for optimal perf")
  proc = cb => cb
}

export const getMidpoint = proc((size, offset) => add(offset, divide(size, 2)))

export const getIsAfterActive = proc((currentIndex, activeIndex) => greaterThan(currentIndex, activeIndex))

export const getHoverMid = proc((
  isAfterActive,
  midpoint,
  activeCellSize,
) => cond(
  isAfterActive,
  sub(midpoint, activeCellSize),
  midpoint,
))

export const getIsShifted = proc((translate) => greaterThan(translate, 0))

export const getIsAfterHoverMid = proc((hoverMid, hoverOffset) => greaterOrEq(hoverMid, hoverOffset))

export const getTranslate = proc((isHovering, currentIndex, activeIndex, isAfterHoverMid, activeCellSize) => cond(and(
  isHovering,
  neq(currentIndex, activeIndex)
), [
    cond(isAfterHoverMid, activeCellSize, 0),
  ],
  0))

export const getCellStart = proc((isAfterActive, size, offset, activeCellSize, scrollOffset) => cond(isAfterActive, [
  sub(
    sub(add(offset, size), activeCellSize), scrollOffset)
], [
    sub(offset, scrollOffset)
  ]))

const setIfAfterOrShifted = proc((val, isAfterActive, isShifted, afterAndShifted, afterNotShifted, notAfterShifted, notAfterNotShifted) => set(val,
  cond(isAfterActive,
    cond(isShifted, afterAndShifted, afterNotShifted), [
      cond(isShifted, notAfterShifted, notAfterNotShifted)
    ])
))

export const getOnChangeTranslate = proc((
  translate,
  hasMoved,
  isAfterActive,
  isShifted,
  cellStart,
  size,
  initialized,
  currentIndex,
  hoverScrollSnapshot,
  scrollOffset,
  hoverTo,
  spacerIndex,
  position,
  toValue,
) => block([
  cond(initialized, [
    set(hoverScrollSnapshot, scrollOffset),
    cond(hasMoved, [
      setIfAfterOrShifted(hoverTo, isAfterActive, isShifted, sub(cellStart, size), cellStart, cellStart, add(cellStart, size)),
      setIfAfterOrShifted(spacerIndex, isAfterActive, isShifted, sub(currentIndex, 1), currentIndex, currentIndex, add(currentIndex, 1))
    ], set(position, translate))
  ], set(initialized, 1)),
  set(toValue, translate),
]))


export const getOnCellTap = proc((
  state,
  tapState,
  disabled,
  offset,
  scrollOffset,
  hasMoved,
  hoverTo,
  touchCellOffset,
  onGestureRelease,
  horizontal,
  x,
  y,
) => block([
  cond(and(
    neq(state, tapState),
    not(disabled),
  ), [
      set(tapState, state),
      cond(eq(state, GestureState.BEGAN), [
        set(hasMoved, 0),
        set(hoverTo, sub(offset, scrollOffset)),
        set(touchCellOffset, horizontal ? x : y),
      ]),
      cond(eq(state, GestureState.END), onGestureRelease)
    ]
  )
]))