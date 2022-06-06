import React, { useEffect, useMemo, useRef } from "react";
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
import { isWeb } from "../constants";
import { useCellTranslate } from "../hooks/useCellTranslate";
import { typedMemo } from "../utils";
import { useRefs } from "../context/refContext";
import { useAnimatedValues } from "../context/animatedValueContext";
import CellProvider from "../context/cellContext";
import { useIdentityRetainingCallback } from "../hooks/useIdentityRetainingCallback";

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
      currentIndexAnim.value = index;
    });
  }, [index]);

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

  const indexRef = useRef(index);
  const indexHasChanged = index !== indexRef.current;
  indexRef.current = index;

  const dragInProgress = !!activeKey && !indexHasChanged;
  const isActive = dragInProgress && activeKey === key;

  const animStyle = useAnimatedStyle(() => {
    const _translate = dragInProgress ? translate.value : 0;
    return {
      transform: [
        horizontalAnim.value
          ? { translateX: _translate }
          : { translateY: _translate },
      ],
    };
  }, [dragInProgress, translate]);

  const updateCellMeasurements = useIdentityRetainingCallback(() => {
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
  });

  useEffect(() => {
    if (isWeb) {
      // onLayout isn't called on web when the cell index changes, so we manually re-measure
      requestAnimationFrame(() => {
        updateCellMeasurements();
      });
    }
  }, [index, updateCellMeasurements]);

  const onCellLayout = useIdentityRetainingCallback((e: LayoutChangeEvent) => {
    updateCellMeasurements();
    if (onLayout) onLayout(e);
  });

  const baseStyle = useMemo(() => {
    return {
      elevation: isActive ? 1 : 0,
      zIndex: isActive ? 999 : 0,
      flexDirection: horizontal ? ("row" as const) : ("column" as const),
    };
  }, [isActive, horizontal]);

  // changing zIndex may crash android, but seems to work ok as of RN 68:
  // https://github.com/facebook/react-native/issues/28751

  return (
    <Animated.View
      {...rest}
      ref={viewRef}
      onLayout={onCellLayout}
      style={[
        props.style,
        baseStyle,
        dragInProgress ? animStyle : { transform: [] },
      ]}
      pointerEvents={activeKey ? "none" : "auto"}
    >
      <CellProvider isActive={isActive}>{children}</CellProvider>
    </Animated.View>
  );
}

export default typedMemo(CellRendererComponent);
