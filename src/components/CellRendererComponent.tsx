import React, { useRef } from "react";
import {
  findNodeHandle,
  MeasureLayoutOnSuccessCallback,
  StyleProp,
  ViewStyle,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { isAndroid, isIOS } from "../constants";
import {
  CellProvider,
  useActiveKey,
  useProps,
  useStaticValues,
} from "../context";
import { typedMemo } from "../types";
import { useCellTranslate } from "../hooks/useCellTranslate";

type Props<T> = {
  item: T;
  index: number;
  children: React.ReactNode;
  onLayout: () => void;
  style?: StyleProp<ViewStyle>;
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
    key,
    cellOffset: offset,
    cellSize: size,
    cellIndex: currentIndexAnim,
  });

  const lastKnownTranslate = useSharedValue(0);

  const style = useAnimatedStyle(() => {
    if (activeIndexAnim.value >= 0) {
      // At the end of a drag, we need to swap the translated values for re-initialized values without
      // any visual jank, which may occur if translate values aren't perfectly in sync with list rendering.
      // lastKnownTranslate ensures that items remain translated until the list re-renders.
      lastKnownTranslate.value = translate.value;
    }

    const translateVal =
      activeIndexAnim.value >= 0 ? translate.value : lastKnownTranslate.value;

    return {
      transform: [
        horizontalAnim.value
          ? { translateX: translateVal }
          : { translateY: translateVal },
      ],
    };
  }, [translate]);

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
        props.style,
        style,
        isIOS && { zIndex: isActive ? 999 : 0 },
        isAndroid && { elevation: isActive ? 1 : 0 },
        !activeKey && { transform: [] },
      ]}
    >
      <Animated.View
        pointerEvents={activeKey ? "none" : "auto"}
        style={[props.style, { flexDirection: horizontal ? "row" : "column" }]}
      >
        <CellProvider index={index} isActive={isActive}>
          {children}
        </CellProvider>
      </Animated.View>
    </Animated.View>
  );
}

export default typedMemo(CellRendererComponent);
