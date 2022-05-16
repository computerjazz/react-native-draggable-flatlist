import React, { useCallback, useEffect, useRef } from "react";
import {
  LayoutChangeEvent,
  MeasureLayoutOnSuccessCallback,
  StyleProp,
  ViewStyle,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { useDraggableFlatListContext } from "../context/draggableFlatListContext";
import { isAndroid, isWeb } from "../constants";
import { useCellTranslate } from "../hooks/useCellTranslate";
import { typedMemo } from "../utils";
import { useRefs } from "../context/refContext";
import { useAnimatedValues } from "../context/animatedValueContext";
import CellProvider from "../context/cellContext";

type Props<T> = {
  item: T;
  index: number;
  children: React.ReactNode;
  onLayout?: (e: LayoutChangeEvent) => void;
  style?: StyleProp<ViewStyle>;
};

function CellRendererComponent<T>(props: Props<T>) {
  const { item, index, onLayout, children, ...rest } = props;

  const currentIndexAnim = useSharedValue(index);

  useEffect(() => {
    // If we set the index immediately the newly-ordered data can get out of sync
    // with the activeIndexAnim, and cause the wrong item to momentarily become the
    // "active item", which causes a flicker.
    requestAnimationFrame(() => {
      currentIndexAnim.value = index
    })
  }, [index])

  const viewRef = useRef<Animated.View>(null);
  const { cellDataRef, propsRef, containerRef } = useRefs<T>();

  const { horizontalAnim, scrollOffset } = useAnimatedValues();
  const {
    activeKey,
    keyExtractor,
    horizontal,
  } = useDraggableFlatListContext<T>();

  const key = keyExtractor(item, index);
  const offset = useSharedValue(-1);
  const size = useSharedValue(-1);

  const translate = useCellTranslate({
    cellOffset: offset,
    cellSize: size,
    cellIndex: currentIndexAnim,
  });

  const isActive = activeKey === key;
  const dragInProgress = !!activeKey

  const animStyle = useAnimatedStyle(() => {
    const _translate = dragInProgress ? translate.value : 0
    return {
      transform: [
        horizontalAnim.value
          ? { translateX: _translate }
          : { translateY: _translate },
      ],
    };
  }, [dragInProgress, translate] );

  const updateCellMeasurements = useCallback(() => {
    const onSuccess: MeasureLayoutOnSuccessCallback = (x, y, w, h) => {
      if (isWeb && horizontal) x += scrollOffset.value;
      const cellOffset = horizontal ? x : y;
      const cellSize = horizontal ? w : h;
      cellDataRef.current.set(key, {
        measurements: { size: cellSize, offset: cellOffset },
      });

      size.value = cellSize;
      offset.value = cellOffset;
    };

    const onFail = () => {
      if (propsRef.current?.debug) {
        console.log(`## on measure fail, index: ${index}`);
      }
    };

    const containerNode = containerRef.current;
    const viewNode = viewRef.current;
    const nodeHandle = containerNode;

    if (viewNode && nodeHandle) {
      //@ts-ignore
      viewNode.measureLayout(nodeHandle, onSuccess, onFail);
    }
  }, [
    cellDataRef,
    horizontal,
    index,
    key,
    offset,
    propsRef,
    size,
    scrollOffset,
    containerRef,
  ]);

  useEffect(() => {
    if (isWeb) {
      // onLayout isn't called on web when the cell index changes, so we manually re-measure
      updateCellMeasurements();
    }
  }, [index, updateCellMeasurements]);

  const onCellLayout = useCallback(
    (e: LayoutChangeEvent) => {
      updateCellMeasurements();
      if (onLayout) onLayout(e);
    },
    [updateCellMeasurements, onLayout]
  );

  // changing zIndex may crash android, but seems to work ok as of RN 68:
  // https://github.com/facebook/react-native/issues/28751

  return (
    <Animated.View
      {...rest}
      ref={viewRef}
      onLayout={onCellLayout}
      style={[
        isAndroid && { elevation: isActive ? 1 : 0 },
        { flexDirection: horizontal ? "row" : "column" },
        { zIndex: isActive ? 999 : 0 },
      ]}
      pointerEvents={activeKey ? "none" : "auto"}
    >
      <Animated.View
        {...rest}
        // Including both animated styles and non-animated styles 
        // causes react-native-web to ignore updates in non-animated styles. 
        // Solution is to separate animated styles from non-animated styles
        style={[props.style, animStyle]}
      >
        <CellProvider isActive={isActive}>{children}</CellProvider>
      </Animated.View>
    </Animated.View>
  );
}

export default typedMemo(CellRendererComponent);
