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
import { useAnimatedValues } from "../context/AnimatedValueContext";
import { useRefs } from "../context/RefContext";
import { setupCell, springFill } from "../procs";
import { useSpring } from "./useSpring";
import { useNode } from "../hooks/useNode";
import { useDraggableFlatListContext } from "../context/DraggableFlatListContext";

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
    spacerIndexAnim,
    placeholderOffset,
    isDraggingCell,
    resetTouchedCell,
    disabled,
  } = useAnimatedValues();
  const { animationConfigRef } = useRefs();
  const { onDragEnd } = useDraggableFlatListContext();

  const cellSpring = useSpring({ config: animationConfigRef.current });
  const { clock, state, config } = cellSpring;

  const isAfterActive = useValue(0);
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
  const prevIsDraggingCell = useValue<number>(0);

  const cellTranslate = useNode(
    setupCell(
      cellIndex,
      cellSize,
      cellOffset,
      isAfterActive,
      prevTrans,
      prevSpacerIndex,
      activeIndexAnim,
      activeCellSize,
      hoverOffset,
      spacerIndexAnim,
      //@ts-ignore
      config.toValue,
      state.position,
      state.time,
      state.finished,
      runSpring,
      onFinished,
      isDraggingCell,
      placeholderOffset,
      prevIsDraggingCell,
      clock,
      disabled
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
