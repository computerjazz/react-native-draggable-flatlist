import Animated, {
  block,
  call,
  clockRunning,
  cond,
  eq,
  onChange,
  startClock,
  stopClock,
  useCode,
  useValue,
} from "react-native-reanimated";
import { useStaticValues } from "./context";
import { setupCell, springFill } from "./procs";
import { useSpring } from "./useSpring";
import { useNode } from "./utils";

type Params = {
  cellIndex: Animated.Value<number>;
  cellSize: Animated.Value<number>;
  cellOffset: Animated.Value<number>;
};

export function useCellTranslate({ cellIndex, cellSize, cellOffset }: Params) {
  const {
    activeIndexAnim,
    activeCellSize,
    hoverOffset,
    isHovering,
    spacerIndexAnim,
    placeholderOffset,
    animationConfigRef,
    scrollOffset,
    hasMoved,
    isPressedIn,
    onDragEnd,
    resetTouchedCell,
  } = useStaticValues();

  const cellSpring = useSpring({ config: animationConfigRef.current });
  const { clock, state, config } = cellSpring;

  const initialized = useValue(0);
  const isAfterActive = useValue(0);
  const passiveCellTranslate = useValue(0);
  const isClockRunning = useNode(clockRunning(clock));

  const runSpring = useNode(
    cond(isClockRunning, springFill(clock, state, config))
  );
  const onHasMoved = useNode(
    block([
      startClock(clock),
      call([state.position], ([v]) =>
        console.log(`ON HAS MOVEDstate.position val:`, v)
      ),
    ])
  );
  const onChangeSpacerIndex = useNode(cond(isClockRunning, stopClock(clock)));
  const onFinished = useNode(
    block([
      cond(isClockRunning, [
        stopClock(clock),
        cond(eq(cellIndex, activeIndexAnim), [
          call([cellIndex, activeIndexAnim, spacerIndexAnim], ([v, from, to]) =>
            console.log(`ACTIVE on fin! cellIndex val:${v} ${from} -> ${to}`)
          ),
          resetTouchedCell,
          call([activeIndexAnim, spacerIndexAnim], onDragEnd),
        ]),
      ]),
    ])
  );

  const prevTrans = useValue<number>(0);
  const prevSpacerIndex = useValue<number>(-1);
  const prevIsPressedIn = useValue<number>(0);
  const prevHasMoved = useValue<number>(0);

  const cellTranslate = useNode(
    setupCell(
      cellIndex,
      initialized,
      cellSize,
      cellOffset,
      isAfterActive,
      passiveCellTranslate,
      prevTrans,
      prevSpacerIndex,
      activeIndexAnim,
      activeCellSize,
      hoverOffset,
      scrollOffset,
      isHovering,
      hasMoved,
      spacerIndexAnim,
      config.toValue,
      state.position,
      state.time,
      state.finished,
      runSpring,
      onHasMoved,
      onChangeSpacerIndex,
      onFinished,
      isPressedIn,
      placeholderOffset,
      prevIsPressedIn,
      prevHasMoved
    )
  );

  // This is required to continually evaluate values
  useCode(
    () =>
      block([
        onChange(cellTranslate, []),
        onChange(cellSize, []),
        onChange(cellOffset, []),
        onChange(runSpring, []),
        onChange(prevHasMoved, []),
      ]),
    []
  );

  return cellTranslate;
}
