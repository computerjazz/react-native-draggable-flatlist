import Animated from "react-native-reanimated"
import { State as GestureState } from "react-native-gesture-handler"

let {
  or,
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
  Value,
  spring,
  lessThan,
  lessOrEq,
  multiply,
  debug,
} = Animated

if (!proc) {
  console.warn("Use reanimated > 1.3 for optimal perf")
  proc = cb => cb
}

export const getIsAfterActive = proc((currentIndex, activeIndex) => greaterThan(currentIndex, activeIndex))

export const getCellStart = proc((isAfterActive, offset, activeCellSize, scrollOffset) => sub(
  cond(isAfterActive, sub(offset, activeCellSize), offset), scrollOffset)
)

export const getOnChangeTranslate = proc((
  translate,
  isAfterActive,
  initialized,
  toValue,
  isPressedIn,
) => block([
  cond(or(not(isAfterActive), initialized), [

  ], set(initialized, 1)),
  cond(isPressedIn, set(toValue, translate)),
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
  touchOffset,
) => block([
  cond(and(
    neq(state, tapState),
    not(disabled),
  ), [
    set(tapState, state),
    cond(eq(state, GestureState.BEGAN), [
      set(hasMoved, 0),
      set(hoverTo, sub(offset, scrollOffset)),
      set(touchCellOffset, touchOffset),
    ]),
    cond(eq(state, GestureState.END), onGestureRelease)
  ]
  )
]))

export const hardReset = proc((position, finished, time, toValue) => block([
  set(position, 0),
  set(finished, 0),
  set(time, 0),
  set(toValue, 0),
]))

export const setupCell = proc((
  currentIndex,
  initialized,
  size,
  offset,
  isAfterActive,
  translate,
  prevTrans,
  prevSpacerIndex,
  activeIndex,
  activeCellSize,
  hoverOffset,
  scrollOffset,
  isHovering,
  hoverTo,
  hasMoved,
  spacerIndex,
  toValue,
  position,
  time,
  finished,
  runSpring,
  onHasMoved,
  onChangeSpacerIndex,
  onFinished,
  isPressedIn,
) => block([
  set(isAfterActive, getIsAfterActive(currentIndex, activeIndex)),
  cond(isPressedIn,
    cond(isAfterActive, [
      cond(
        and(
          greaterOrEq(add(hoverOffset, activeCellSize), offset),
          lessThan(add(hoverOffset, activeCellSize), add(offset, divide(size, 2))),
        ),
        set(spacerIndex, sub(currentIndex, 1)),
      ),
      cond(
        and(
          greaterOrEq(add(hoverOffset, activeCellSize), add(offset, divide(size, 2))),
          lessThan(add(hoverOffset, activeCellSize), add(offset, size)),
        ),
        set(spacerIndex, currentIndex)
      )
    ], cond(lessThan(currentIndex, activeIndex), [
      cond(
        and(
          lessThan(hoverOffset, add(offset, size)),
          greaterOrEq(hoverOffset, add(offset, divide(size, 2))),
        ),
        set(spacerIndex, add(currentIndex, 1)),
      ),
      cond(
        and(
          greaterOrEq(hoverOffset, offset),
          lessThan(hoverOffset, add(offset, divide(size, 2)))
        ),
        set(spacerIndex, currentIndex)
      ),
    ])
    ),
  ),

  cond(neq(currentIndex, activeIndex), set(translate, cond(
    cond(isAfterActive,
      lessOrEq(currentIndex, spacerIndex),
      greaterOrEq(currentIndex, spacerIndex),
    ),
    cond(isHovering,
      cond(isAfterActive,
        multiply(activeCellSize, -1),
        activeCellSize
      ), 0), 0)
  )),

  // Set value hovering element will snap to once released
  cond(
    and(
      isHovering,
      eq(spacerIndex, currentIndex),
    ), set(hoverTo,
      sub(
        offset,
        scrollOffset,
        cond(isAfterActive, sub(activeCellSize, size)), // Account for cells of differing size
      ),
    ),
  ),

  set(toValue, translate),
  cond(and(isPressedIn, neq(translate, prevTrans)), [
    set(prevTrans, translate),
    getOnChangeTranslate(
      translate,
      isAfterActive,
      initialized,
      toValue,
      isPressedIn,
    ),
    cond(hasMoved, onHasMoved, set(position, translate)),
  ]),
  cond(neq(prevSpacerIndex, spacerIndex), [
    set(prevSpacerIndex, spacerIndex),
    cond(eq(spacerIndex, -1), [
      // Hard reset to prevent stale state bugs
      onChangeSpacerIndex,
      hardReset(position, finished, time, toValue)
    ]),
  ]),
  runSpring,
  cond(finished, [
    onFinished,
    set(time, 0),
    set(finished, 0),
  ]),
  position,
]))

const betterSpring = proc(
  (
    finished,
    velocity,
    position,
    time,
    prevPosition,
    toValue,
    damping,
    mass,
    stiffness,
    overshootClamping,
    restSpeedThreshold,
    restDisplacementThreshold,
    clock
  ) =>
    spring(
      clock,
      {
        finished,
        velocity,
        position,
        time,
        prevPosition,
      },
      {
        toValue,
        damping,
        mass,
        stiffness,
        overshootClamping,
        restDisplacementThreshold,
        restSpeedThreshold,
      }
    )
);

export function springFill(clock, state, config) {
  return betterSpring(
    state.finished,
    state.velocity,
    state.position,
    state.time,
    new Value(0),
    config.toValue,
    config.damping,
    config.mass,
    config.stiffness,
    config.overshootClamping,
    config.restSpeedThreshold,
    config.restDisplacementThreshold,
    clock
  );
}