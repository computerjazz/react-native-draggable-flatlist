import Animated from "react-native-reanimated";

const {
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
  Value,
  spring,
  lessThan,
  lessOrEq,
  multiply,
} = Animated;
let { proc } = Animated;

if (!proc) {
  console.warn("Use reanimated > 1.3 for optimal perf");
  const procStub = <T,>(cb: T) => cb;
  proc = procStub;
}

export const getIsAfterActive = proc(
  (currentIndex: Animated.Node<number>, activeIndex: Animated.Node<number>) =>
    greaterThan(currentIndex, activeIndex)
);

export const getCellStart = proc(
  (
    isAfterActive: Animated.Node<number>,
    offset: Animated.Node<number>,
    activeCellSize: Animated.Node<number>,
    scrollOffset: Animated.Node<number>
  ) =>
    sub(cond(isAfterActive, sub(offset, activeCellSize), offset), scrollOffset)
);

export const getOnChangeTranslate = proc(
  (
    translate: Animated.Node<number>,
    isAfterActive: Animated.Node<number>,
    initialized: Animated.Value<number>,
    toValue: Animated.Value<number>,
    isPressedIn: Animated.Node<number>
  ) =>
    block([
      cond(or(not(isAfterActive), initialized), [], set(initialized, 1)),
      cond(isPressedIn, set(toValue, translate)),
    ])
);

export const hardReset = proc(
  (
    position: Animated.Value<number>,
    finished: Animated.Value<number>,
    time: Animated.Value<number>,
    toValue: Animated.Value<number>
  ) =>
    block([set(position, 0), set(finished, 0), set(time, 0), set(toValue, 0)])
);

/**
 * The in react-native-reanimated.d.ts definition of `proc` only has generics
 * for up to 10 arguments. We cast it to accept any params to avoid errors when
 * type-checking.
 */
type RetypedProc = (cb: (...params: any) => Animated.Node<number>) => typeof cb;

export const setupCell = proc(
  (
    currentIndex: Animated.Value<number>,
    initialized: Animated.Value<number>,
    size: Animated.Node<number>,
    offset: Animated.Node<number>,
    isAfterActive: Animated.Value<number>,
    translate: Animated.Value<number>,
    prevTrans: Animated.Value<number>,
    prevSpacerIndex: Animated.Value<number>,
    activeIndex: Animated.Node<number>,
    activeCellSize: Animated.Node<number>,
    hoverOffset: Animated.Node<number>,
    scrollOffset: Animated.Node<number>,
    isHovering: Animated.Node<number>,
    hoverTo: Animated.Value<number>,
    hasMoved: Animated.Value<number>,
    spacerIndex: Animated.Value<number>,
    toValue: Animated.Value<number>,
    position: Animated.Value<number>,
    time: Animated.Value<number>,
    finished: Animated.Value<number>,
    runSpring: Animated.Node<number>,
    onHasMoved: Animated.Node<number>,
    onChangeSpacerIndex: Animated.Node<number>,
    onFinished: Animated.Node<number>,
    isPressedIn: Animated.Node<number>,
    placeholderOffset: Animated.Value<number>
  ) =>
    block([
      set(isAfterActive, getIsAfterActive(currentIndex, activeIndex)),

      // Determining spacer index is hard to visualize.
      // see diagram here: https://i.imgur.com/jRPf5t3.jpg
      cond(
        isPressedIn,
        cond(
          isAfterActive,
          [
            cond(
              and(
                greaterOrEq(add(hoverOffset, activeCellSize), offset),
                lessThan(
                  add(hoverOffset, activeCellSize),
                  add(offset, divide(size, 2))
                )
              ),
              set(spacerIndex, sub(currentIndex, 1))
            ),
            cond(
              and(
                greaterOrEq(
                  add(hoverOffset, activeCellSize),
                  add(offset, divide(size, 2))
                ),
                lessThan(add(hoverOffset, activeCellSize), add(offset, size))
              ),
              set(spacerIndex, currentIndex)
            ),
          ],
          cond(lessThan(currentIndex, activeIndex), [
            cond(
              and(
                lessThan(hoverOffset, add(offset, size)),
                greaterOrEq(hoverOffset, add(offset, divide(size, 2)))
              ),
              set(spacerIndex, add(currentIndex, 1))
            ),
            cond(
              and(
                greaterOrEq(hoverOffset, offset),
                lessThan(hoverOffset, add(offset, divide(size, 2)))
              ),
              set(spacerIndex, currentIndex)
            ),
          ])
        )
      ),

      // Translate cell down if it is before active index and active cell has passed it.
      // Translate cell up if it is after the active index and active cell has passed it.
      cond(
        neq(currentIndex, activeIndex),
        set(
          translate,
          cond(
            cond(
              isAfterActive,
              lessOrEq(currentIndex, spacerIndex),
              greaterOrEq(currentIndex, spacerIndex)
            ),
            cond(
              isHovering,
              cond(isAfterActive, multiply(activeCellSize, -1), activeCellSize),
              0
            ),
            0
          )
        )
      ),

      // Set value hovering element will snap to once released
      cond(
        and(isHovering, eq(spacerIndex, currentIndex)),
        set(
          hoverTo,
          sub(
            offset,
            scrollOffset,
            cond(isAfterActive, sub(activeCellSize, size), 0) // Account for cells of differing size
          )
        )
      ),

      set(toValue, translate),
      cond(and(isPressedIn, neq(translate, prevTrans)), [
        set(prevTrans, translate),
        getOnChangeTranslate(
          translate,
          isAfterActive,
          initialized,
          toValue,
          isPressedIn
        ),
        cond(hasMoved, onHasMoved, set(position, translate)),
      ]),
      cond(neq(prevSpacerIndex, spacerIndex), [
        set(prevSpacerIndex, spacerIndex),
        cond(eq(spacerIndex, -1), [
          // Hard reset to prevent stale state bugs
          onChangeSpacerIndex,
          hardReset(position, finished, time, toValue),
        ]),
      ]),
      runSpring,
      cond(finished, [onFinished, set(time, 0), set(finished, 0)]),
      cond(
        eq(spacerIndex, currentIndex),
        set(
          placeholderOffset,
          cond(isAfterActive, add(sub(offset, activeCellSize), size), offset)
        )
      ),
      position,
    ])
);

const betterSpring = (proc as RetypedProc)(
  (
    finished: Animated.Value<number>,
    velocity: Animated.Value<number>,
    position: Animated.Value<number>,
    time: Animated.Value<number>,
    prevPosition: Animated.Value<number>,
    toValue: Animated.Value<number>,
    damping: Animated.Value<number>,
    mass: Animated.Value<number>,
    stiffness: Animated.Value<number>,
    overshootClamping: Animated.SpringConfig["overshootClamping"],
    restSpeedThreshold: Animated.Value<number>,
    restDisplacementThreshold: Animated.Value<number>,
    clock: Animated.Clock
  ) =>
    spring(
      clock,
      {
        finished,
        velocity,
        position,
        time,
        // @ts-ignore -- https://github.com/software-mansion/react-native-reanimated/blob/master/src/animations/spring.js#L177
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

export function springFill(
  clock: Animated.Clock,
  state: Animated.SpringState,
  config: Animated.SpringConfig
) {
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
