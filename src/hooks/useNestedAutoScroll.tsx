import { DependencyList, useRef } from "react";
import Animated, {
  abs,
  add,
  and,
  block,
  call,
  cond,
  eq,
  greaterOrEq,
  lessOrEq,
  max,
  not,
  onChange,
  or,
  set,
  sub,
  useCode,
  useValue,
} from "react-native-reanimated";
import { State as GestureState } from "react-native-gesture-handler";
import { useNestableScrollContainerContext } from "../context/nestableScrollContainerContext";
import { SCROLL_POSITION_TOLERANCE } from "../constants";

function useNodeAlt<T>(node: Animated.Node<T>, deps: DependencyList = []) {
  // NOTE: memoizing currently breaks animations, not sure why
  // return useMemo(() => node, deps)
  return node;
}

const DUMMY_VAL = new Animated.Value<number>(0);

// This is mostly copied over from the main react-native-draggable-flatlist
// useAutoScroll hook with a few notable exceptions:
// - Since Animated.Values are now coming from the caller,
//   we won't guarantee they exist and default if not.
//   This changes our useNode implementation since we don't want to store stale nodes.
// - Outer scrollable is a ScrollView, not a FlatList
// TODO: see if we can combine into a single `useAutoScroll()` hook

export function useNestedAutoScroll({
  activeCellSize = DUMMY_VAL,
  autoscrollSpeed = 100,
  autoscrollThreshold = 30,
  hoverAnim = DUMMY_VAL,
  isDraggingCell = DUMMY_VAL,
  panGestureState = DUMMY_VAL,
}: {
  activeCellSize?: Animated.Node<number>;
  autoscrollSpeed?: number;
  autoscrollThreshold?: number;
  hoverAnim?: Animated.Node<number>;
  isDraggingCell?: Animated.Node<number>;
  panGestureState?: Animated.Node<GestureState | number>;
}) {
  const {
    outerScrollOffset,
    containerSize,
    scrollableRef,
    scrollViewSize,
  } = useNestableScrollContainerContext();

  const scrollOffset = outerScrollOffset;

  const isScrolledUp = useNodeAlt(
    lessOrEq(sub(scrollOffset, SCROLL_POSITION_TOLERANCE), 0),
    [scrollOffset]
  );
  const isScrolledDown = useNodeAlt(
    greaterOrEq(
      add(scrollOffset, containerSize, SCROLL_POSITION_TOLERANCE),
      scrollViewSize
    ),
    [scrollOffset, containerSize, scrollViewSize]
  );

  const distToTopEdge = useNodeAlt(max(0, sub(hoverAnim, scrollOffset)), [
    hoverAnim,
    scrollOffset,
  ]);
  const distToBottomEdge = useNodeAlt(
    max(
      0,
      sub(containerSize, add(sub(hoverAnim, scrollOffset), activeCellSize))
    ),
    [containerSize, hoverAnim, scrollOffset, activeCellSize]
  );

  const isAtTopEdge = useNodeAlt(lessOrEq(distToTopEdge, autoscrollThreshold), [
    distToTopEdge,
    autoscrollThreshold,
  ]);
  const isAtBottomEdge = useNodeAlt(
    lessOrEq(distToBottomEdge, autoscrollThreshold!),
    [distToBottomEdge, autoscrollThreshold]
  );

  const isAtEdge = useNodeAlt(or(isAtBottomEdge, isAtTopEdge), [
    isAtBottomEdge,
    isAtTopEdge,
  ]);
  const autoscrollParams = [
    distToTopEdge,
    distToBottomEdge,
    scrollOffset,
    isScrolledUp,
    isScrolledDown,
  ];

  const targetScrollOffset = useValue<number>(0);
  const resolveAutoscroll = useRef<(params: readonly number[]) => void>();

  const isAutoScrollInProgressNative = useValue<number>(0);

  const isAutoScrollInProgress = useRef({
    js: false,
    native: isAutoScrollInProgressNative,
  });

  const isDraggingCellJS = useRef(false);
  useCode(
    () =>
      block([
        onChange(
          isDraggingCell,
          call([isDraggingCell], ([v]) => {
            isDraggingCellJS.current = !!v;
          })
        ),
      ]),
    [isDraggingCell]
  );

  // Ensure that only 1 call to autoscroll is active at a time
  const autoscrollLooping = useRef(false);

  const onAutoscrollComplete = (params: readonly number[]) => {
    isAutoScrollInProgress.current.js = false;
    resolveAutoscroll.current?.(params);
  };

  const scrollToAsync = (offset: number): Promise<readonly number[]> =>
    new Promise((resolve) => {
      resolveAutoscroll.current = resolve;
      targetScrollOffset.setValue(offset);
      isAutoScrollInProgress.current.native.setValue(1);
      isAutoScrollInProgress.current.js = true;

      scrollableRef.current?.scrollTo?.({ y: offset });
    });

  const getScrollTargetOffset = (
    distFromTop: number,
    distFromBottom: number,
    scrollOffset: number,
    isScrolledUp: boolean,
    isScrolledDown: boolean
  ) => {
    if (isAutoScrollInProgress.current.js) return -1;
    const scrollUp = distFromTop < autoscrollThreshold!;
    const scrollDown = distFromBottom < autoscrollThreshold!;
    if (
      !(scrollUp || scrollDown) ||
      (scrollUp && isScrolledUp) ||
      (scrollDown && isScrolledDown)
    )
      return -1;
    const distFromEdge = scrollUp ? distFromTop : distFromBottom;
    const speedPct = 1 - distFromEdge / autoscrollThreshold!;
    const offset = speedPct * autoscrollSpeed;
    const targetOffset = scrollUp
      ? Math.max(0, scrollOffset - offset)
      : scrollOffset + offset;
    return targetOffset;
  };

  const autoscroll = async (params: readonly number[]) => {
    if (autoscrollLooping.current) {
      return;
    }
    autoscrollLooping.current = true;
    try {
      let shouldScroll = true;
      let curParams = params;
      while (shouldScroll) {
        const [
          distFromTop,
          distFromBottom,
          scrollOffset,
          isScrolledUp,
          isScrolledDown,
        ] = curParams;
        const targetOffset = getScrollTargetOffset(
          distFromTop,
          distFromBottom,
          scrollOffset,
          !!isScrolledUp,
          !!isScrolledDown
        );
        const scrollingUpAtTop = !!(
          isScrolledUp && targetOffset <= scrollOffset
        );
        const scrollingDownAtBottom = !!(
          isScrolledDown && targetOffset >= scrollOffset
        );
        shouldScroll =
          targetOffset >= 0 &&
          isDraggingCellJS.current &&
          !scrollingUpAtTop &&
          !scrollingDownAtBottom;
        if (shouldScroll) {
          try {
            curParams = await scrollToAsync(targetOffset);
          } catch (err) {}
        }
      }
    } finally {
      autoscrollLooping.current = false;
    }
  };

  const checkAutoscroll = useNodeAlt(
    cond(
      and(
        isAtEdge,
        not(and(isAtTopEdge, isScrolledUp)),
        not(and(isAtBottomEdge, isScrolledDown)),
        eq(panGestureState, GestureState.ACTIVE),
        not(isAutoScrollInProgress.current.native)
      ),
      call(autoscrollParams, autoscroll)
    ),
    [
      isAtEdge,
      isAtTopEdge,
      isScrolledUp,
      isAtBottomEdge,
      isScrolledDown,
      panGestureState,
    ]
  );

  const onScrollNode = useNodeAlt(
    cond(
      and(
        isAutoScrollInProgress.current.native,
        or(
          // We've scrolled to where we want to be
          lessOrEq(
            abs(sub(targetScrollOffset, scrollOffset)),
            SCROLL_POSITION_TOLERANCE
          ),
          // We're at the start, but still want to scroll farther up
          and(isScrolledUp, lessOrEq(targetScrollOffset, scrollOffset)),
          // We're at the end, but still want to scroll further down
          and(isScrolledDown, greaterOrEq(targetScrollOffset, scrollOffset))
        )
      ),
      [
        // Finish scrolling
        set(isAutoScrollInProgress.current.native, 0),
        call(autoscrollParams, onAutoscrollComplete),
      ]
    ),
    [
      targetScrollOffset,
      scrollOffset,
      isScrolledUp,
      isScrolledDown,
      isAutoScrollInProgress.current.native,
    ]
  );

  useCode(() => checkAutoscroll, [hoverAnim]);
  useCode(() => onChange(scrollOffset, onScrollNode), [hoverAnim]);

  return onScrollNode;
}
