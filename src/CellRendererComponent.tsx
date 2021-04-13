import React, { useRef } from "react";
import { findNodeHandle, MeasureLayoutOnSuccessCallback } from "react-native";
import Animated, {
  useAnimatedReaction,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useDraggableFlatListContext } from "./DraggableFlatListContext";

type Props<T> = {
  item: T;
  index: number;
  children: React.ReactNode;
  onLayout: () => void;
};

function CellRendererComponent<T>(props: Props<T>) {
  const { item, index, children } = props;

  const currentIndexAnim = useSharedValue(index);
  currentIndexAnim.value = index;
  const viewRef = useRef<Animated.View>(null);
  const {
    cellDataRef,
    activeIndexAnim,
    spacerIndexAnim,
    hoverOffset,
    activeCellSize,
    isHovering,
    horizontalAnim,
    animationConfigRef,
    placeholderOffset,
    scrollOffset,
    propsRef,
    keyExtractor,
    activeKey,
    flatlistRef,
  } = useDraggableFlatListContext();
  const { horizontal } = propsRef;

  const key = keyExtractor(item, index);
  const offset = useSharedValue(-1);
  const size = useSharedValue(-1);

  useDerivedValue(() => {
    // Determining spacer index is hard to visualize. See diagram: https://i.imgur.com/jRPf5t3.jpg
    const isAfterActive = currentIndexAnim.value > activeIndexAnim.value;
    const isBeforeActive = currentIndexAnim.value < activeIndexAnim.value;
    const hoverPlusActiveSize = hoverOffset.value + activeCellSize.value;
    const offsetPlusHalfSize = offset.value + size.value / 2;
    const offsetPlusSize = offset.value + size.value;
    let result = -1;
    if (isAfterActive) {
      if (
        hoverPlusActiveSize >= offset.value &&
        hoverPlusActiveSize < offsetPlusHalfSize
      ) {
        // bottom edge of active cell overlaps top half of current cell
        result = currentIndexAnim.value - 1;
      } else if (
        hoverPlusActiveSize >= offsetPlusHalfSize &&
        hoverPlusActiveSize < offsetPlusSize
      ) {
        // bottom edge of active cell overlaps bottom half of current cell
        result = currentIndexAnim.value;
      }
    } else if (isBeforeActive) {
      if (
        hoverOffset.value < offsetPlusSize &&
        hoverOffset.value >= offsetPlusHalfSize
      ) {
        // top edge of active cell overlaps bottom half of current cell
        result = currentIndexAnim.value + 1;
      } else if (
        hoverOffset.value >= offset.value &&
        hoverOffset.value < offsetPlusHalfSize
      ) {
        // top edge of active cell overlaps top half of current cell
        result = currentIndexAnim.value;
      }
    }
    if (result !== -1 && isHovering.value) {
      spacerIndexAnim.value = result;
    }
    if (!isHovering.value && spacerIndexAnim.value !== -1)
      spacerIndexAnim.value = -1;
    return spacerIndexAnim.value;
  });

  useAnimatedReaction(
    () => {
      const isSpacerIndex = spacerIndexAnim.value === currentIndexAnim.value;
      return isSpacerIndex;
    },
    (result, prev) => {
      if (result && result !== prev) {
        // item has not yet initialized
        if (size.value === -1 || offset.value === -1) return;
        const isAfterActive = currentIndexAnim.value > activeIndexAnim.value;
        const newPlaceholderOffset = isAfterActive
          ? size.value + (offset.value - activeCellSize.value)
          : offset.value;
        placeholderOffset.value = newPlaceholderOffset - scrollOffset.value;
      }
    }
  );

  const translate = useDerivedValue(() => {
    // Translate cell down if it is before active index and active cell has passed it.
    // Translate cell up if it is after the active index and active cell has passed it.
    if (currentIndexAnim.value !== activeIndexAnim.value) {
      const isAfterActive = currentIndexAnim.value > activeIndexAnim.value;
      const propertyToCheck = isAfterActive
        ? currentIndexAnim.value <= spacerIndexAnim.value
        : currentIndexAnim.value >= spacerIndexAnim.value;

      if (propertyToCheck) {
        if (isHovering.value) {
          return isAfterActive
            ? activeCellSize.value * -1
            : activeCellSize.value;
        } else {
          return 0;
        }
      } else {
        return 0;
      }
    }
    return 0;
  });

  const springTranslate = useDerivedValue(() => {
    return isHovering.value
      ? withSpring(translate.value, animationConfigRef.current)
      : translate.value;
  });

  const style = useAnimatedStyle(() => {
    return {
      transform: [
        horizontalAnim.value
          ? { translateX: springTranslate.value }
          : { translateY: springTranslate.value },
      ],
    };
  });

  const isActiveCell = activeKey === key;

  const onLayout = () => {
    const onSuccess: MeasureLayoutOnSuccessCallback = (x, y, w, h) => {
      const cellOffset = horizontal ? x : y;
      const cellSize = horizontal ? w : h;
      if (isHovering.value && activeIndexAnim.value === index) {
        // Skip measurement for active item -- it will be incorrect
        return;
      }
      cellDataRef.current.set(key, {
        measurements: { size: cellSize, offset: cellOffset },
      });
      size.value = cellSize;
      offset.value = cellOffset;
    };

    const onFail = () => {
      if (propsRef.debug) console.log(`## on measure fail, index: ${index}`);
    };

    const viewNode = viewRef.current;
    const flatListNode = flatlistRef.current;
    if (viewNode && flatListNode) {
      const nodeHandle = findNodeHandle(flatListNode);
      if (nodeHandle) viewNode.measureLayout(nodeHandle, onSuccess, onFail);
    }
  };

  return (
    <Animated.View ref={viewRef} onLayout={onLayout} style={style}>
      <Animated.View
        pointerEvents={activeKey ? "none" : "auto"}
        style={{ flexDirection: horizontal ? "row" : "column" }}
      >
        <Animated.View style={isActiveCell ? { opacity: 0 } : undefined}>
          {children}
        </Animated.View>
      </Animated.View>
    </Animated.View>
  );
}

export default React.memo(CellRendererComponent);
