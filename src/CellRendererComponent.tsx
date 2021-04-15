import React, { useRef } from "react";
import { findNodeHandle, MeasureLayoutOnSuccessCallback } from "react-native";
import Animated, {
  useAnimatedReaction,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import {
  useActiveKey,
  useProps,
  useStaticValues,
} from "./DraggableFlatListContext";
import { useCellTranslate } from "./useCellTranslate";

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
    isHovering,
    horizontalAnim,
    keyExtractor,
    flatlistRef,
    propsRef,
  } = useStaticValues<T>();

  const { activeKey } = useActiveKey();
  const { horizontal } = useProps();

  const key = keyExtractor(item, index);
  const offset = useSharedValue(-1);
  const size = useSharedValue(-1);
  const translate = useCellTranslate({
    cellOffset: offset,
    cellSize: size,
    cellIndex: currentIndexAnim,
  });

  const style = useAnimatedStyle(() => {
    return {
      transform: [
        horizontalAnim.value
          ? { translateX: translate.value }
          : { translateY: translate.value },
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
      if (propsRef.current.debug)
        console.log(`## on measure fail, index: ${index}`);
    };

    const viewNode = viewRef.current;
    const flatListNode = flatlistRef.current;
    if (viewNode && flatListNode) {
      //@ts-ignore
      const nodeHandle = findNodeHandle(flatListNode);
      //@ts-ignore
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
