import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
} from "react";
import { MeasureLayoutOnSuccessCallback } from "react-native";
import Animated, { cond, useValue } from "react-native-reanimated";
import { useDraggableFlatListContext } from "../context/DraggableFlatListContext";
import { isAndroid, isIOS, isWeb } from "../constants";
import { useCellTranslate } from "../hooks/useCellTranslate";
import { typedMemo } from "../utils";
import { useRefs } from "../context/RefContext";
import { useAnimatedValues } from "../context/AnimatedValueContext";
import CellProvider from "../context/CellContext";

type Props<T> = {
  item: T;
  index: number;
  children: React.ReactNode;
  onLayout: () => void;
};

function CellRendererComponent<T>(props: Props<T>) {
  const { item, index, children } = props;

  const currentIndexAnim = useValue(index);

  useLayoutEffect(() => {
    currentIndexAnim.setValue(index);
  }, [index, currentIndexAnim]);

  const viewRef = useRef<Animated.View>(null);
  const { cellDataRef, propsRef, containerRef } = useRefs<T>();

  const { horizontalAnim } = useAnimatedValues();
  const {
    activeKey,
    keyExtractor,
    horizontal,
  } = useDraggableFlatListContext<T>();

  const key = keyExtractor(item, index);
  const offset = useValue<number>(-1);
  const size = useValue<number>(-1);
  const translate = useCellTranslate({
    cellOffset: offset,
    cellSize: size,
    cellIndex: currentIndexAnim,
  });

  const isActive = activeKey === key;

  const style = useMemo(
    () => ({
      transform: [
        { translateX: cond(horizontalAnim, translate, 0) },
        { translateY: cond(horizontalAnim, 0, translate) },
      ],
    }),
    [horizontalAnim, translate]
  );

  const onLayout = useCallback(() => {
    const onSuccess: MeasureLayoutOnSuccessCallback = (x, y, w, h) => {
      const cellOffset = horizontal ? x : y;
      const cellSize = horizontal ? w : h;
      cellDataRef.current.set(key, {
        measurements: { size: cellSize, offset: cellOffset },
      });
      size.setValue(cellSize);
      offset.setValue(cellOffset);
    };

    const onFail = () => {
      if (propsRef.current?.debug) {
        console.log(`## on measure fail, index: ${index}`);
      }
    };
    //@ts-ignore
    viewRef.current.measureLayout(containerRef.current, onSuccess, onFail);
  }, [
    cellDataRef,
    horizontal,
    index,
    key,
    offset,
    propsRef,
    size,
    containerRef,
  ]);

  useEffect(() => {
    if (isWeb) {
      setTimeout(() => {
        onLayout();
        setTimeout(onLayout);
      }, 50);
    }
  }, [index, onLayout]);

  // changing zIndex crashes android:
  // https://github.com/facebook/react-native/issues/28751
  return (
    <Animated.View
      ref={viewRef}
      onLayout={onLayout}
      style={[
        style,
        isAndroid && { elevation: isActive ? 1 : 0 },
        { flexDirection: horizontal ? "row" : "column" },
        // web doesn't update zIndex if we use a ternary, it has to be completely added/removed from the DOM
        (isWeb || isIOS) && { zIndex: isActive ? 999 : 0 },
      ]}
      pointerEvents={activeKey ? "none" : "auto"}
    >
      <CellProvider isActive={isActive}>{children}</CellProvider>
    </Animated.View>
  );
}

export default typedMemo(CellRendererComponent);
