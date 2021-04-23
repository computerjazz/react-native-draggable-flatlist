import React, { useEffect, useRef } from "react";
import { findNodeHandle, MeasureLayoutOnSuccessCallback } from "react-native";
import Animated, { cond, useValue } from "react-native-reanimated";
import { isAndroid, isIOS } from "./constants";
import { useActiveKey, useProps, useStaticValues } from "./context";
import { useCellTranslate } from "./useCellTranslate";
import { typedMemo } from "./utils";

type Props<T> = {
  item: T;
  index: number;
  children: React.ReactNode;
  onLayout: () => void;
};

function CellRendererComponent<T>(props: Props<T>) {
  const { item, index, children } = props;

  const currentIndexAnim = useValue(index);

  useEffect(() => {
    currentIndexAnim.setValue(index);
  }, [index, currentIndexAnim]);

  const viewRef = useRef<Animated.View>(null);
  const {
    cellDataRef,
    horizontalAnim,
    keyExtractor,
    flatlistRef,
    propsRef,
  } = useStaticValues<T>();

  const { activeKey } = useActiveKey();
  const { horizontal } = useProps();

  const key = keyExtractor(item, index);
  const offset = useValue<number>(-1);
  const size = useValue<number>(-1);
  const translate = useCellTranslate({
    cellOffset: offset,
    cellSize: size,
    cellIndex: currentIndexAnim,
  });

  const style = {
    transform: [
      { translateX: cond(horizontalAnim, translate, 0) },
      { translateY: cond(horizontalAnim, 0, translate) },
    ],
  };

  const onLayout = () => {
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

    const viewNode = viewRef.current;
    const flatListNode = flatlistRef.current;
    if (viewNode && flatListNode) {
      //@ts-ignore
      const nodeHandle = findNodeHandle(flatListNode);
      //@ts-ignore
      if (nodeHandle) viewNode.measureLayout(nodeHandle, onSuccess, onFail);
    }
  };

  const isActive = activeKey === key;

  // changing zIndex crashes android:
  // https://github.com/facebook/react-native/issues/28751
  return (
    <Animated.View
      ref={viewRef}
      onLayout={onLayout}
      style={[
        style,
        isIOS && { zIndex: isActive ? 999 : 0 },
        isAndroid && { elevation: isActive ? 1 : 0 },
      ]}
    >
      <Animated.View
        pointerEvents={activeKey ? "none" : "auto"}
        style={{ flexDirection: horizontal ? "row" : "column" }}
      >
        {children}
      </Animated.View>
    </Animated.View>
  );
}

export default typedMemo(CellRendererComponent);
