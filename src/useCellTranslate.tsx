import Animated, {
  block,
  call,
  clockRunning,
  cond,
  eq,
  onChange,
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
    hasMoved,
    isPressedIn,
    onDragEnd,
    resetTouchedCell,
  } = useStaticValues();

  const cellSpring = useSpring({ config: animationConfigRef.current });
  const { clock, state, config } = cellSpring;

  const isAfterActive = useValue(0);
  const passiveCellTranslate = useValue(0);
  const isClockRunning = useNode(clockRunning(clock));

  const runSpring = useNode(springFill(clock, state, config));

  const onFinished = useNode(
    cond(isClockRunning, [
      stopClock(clock),
      cond(eq(cellIndex, activeIndexAnim), [
        resetTouchedCell,
        call([activeIndexAnim, spacerIndexAnim], onDragEnd),
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
      cellSize,
      cellOffset,
      isAfterActive,
      passiveCellTranslate,
      prevTrans,
      prevSpacerIndex,
      activeIndexAnim,
      activeCellSize,
      hoverOffset,
      isHovering,
      hasMoved,
      spacerIndexAnim,
      //@ts-ignore
      config.toValue,
      state.position,
      state.time,
      state.finished,
      runSpring,
      onFinished,
      isPressedIn,
      placeholderOffset,
      prevIsPressedIn,
      prevHasMoved,
      clock
    )
  );

  // This is required to continually evaluate values
  useCode(
    () =>
      block([
        onChange(cellTranslate, []),
        onChange(prevTrans, []),
        onChange(cellSize, []),
        onChange(cellOffset, []),
      ]),
    []
  );

  return cellTranslate;
}
