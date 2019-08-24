import Animated from "react-native-reanimated"

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
  cond(not(hasMoved), set(position, translate)),
  cond(initialized, set(hoverScrollSnapshot, scrollOffset)),
  cond(and(initialized, hasMoved), [
    set(hoverTo,
      cond(isAfterActive, cond(isShifted, sub(cellStart, size), cellStart), [
        cond(isShifted, cellStart, add(cellStart, size))
      ])
    ),
    cond(and(
      not(isAfterActive),
      greaterThan(translate, 0)
    ),
      set(spacerIndex, currentIndex)
    ),
    cond(and(
      not(isAfterActive),
      eq(translate, 0),
    ),
      set(spacerIndex, add(currentIndex, 1))
    ),
    cond(and(
      isAfterActive,
      eq(translate, 0),
    ),
      set(spacerIndex, currentIndex),
    ),
    cond(and(
      isAfterActive,
      greaterThan(translate, 0),
    ),
      set(spacerIndex, sub(currentIndex, 1))
    ),
  ]),
  set(toValue, translate),
  cond(not(initialized), set(initialized, 1)),
]))