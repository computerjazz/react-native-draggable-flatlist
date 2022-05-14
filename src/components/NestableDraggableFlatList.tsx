import React, { useRef, useState } from "react";
import { findNodeHandle, LogBox } from "react-native";
import Animated, {
  useDerivedValue,
  useSharedValue,
} from "react-native-reanimated";
import { DraggableFlatListProps } from "../types";
import DraggableFlatList from "../components/DraggableFlatList";
import { useNestableScrollContainerContext } from "../context/nestableScrollContainerContext";
import { useNestedAutoScroll } from "../hooks/useNestedAutoScroll";

export function NestableDraggableFlatList<T>(props: DraggableFlatListProps<T>) {
  const hasSuppressedWarnings = useRef(false);

  if (!hasSuppressedWarnings.current) {
    LogBox.ignoreLogs([
      "VirtualizedLists should never be nested inside plain ScrollViews with the same orientation because it can break windowing",
    ]); // Ignore log notification by message
    //@ts-ignore
    console.reportErrorsAsExceptions = false;
    hasSuppressedWarnings.current = true;
  }

  const {
    containerRef,
    outerScrollOffset,
    setOuterScrollEnabled,
  } = useNestableScrollContainerContext();

  const listVerticalOffset = useSharedValue(0);
  const viewRef = useRef<Animated.View>(null);
  const [animVals, setAnimVals] = useState({});
  const defaultHoverAnim = useSharedValue(0);
  const [hoverAnim, setHoverAnim] = useState(defaultHoverAnim);

  const hoverAnimWithOffset = useDerivedValue(() => {
    return hoverAnim.value + listVerticalOffset.value;
  }, [hoverAnim]);

  useNestedAutoScroll(animVals);

  const onListContainerLayout = async () => {
    const viewNode = viewRef.current;
    const nodeHandle = findNodeHandle(containerRef.current);

    const onSuccess = (_x: number, y: number) => {
      listVerticalOffset.value = y;
    };
    const onFail = () => {
      console.log("## nested draggable list measure fail");
    };
    //@ts-ignore
    viewNode.measureLayout(nodeHandle, onSuccess, onFail);
  };

  return (
    <Animated.View ref={viewRef} onLayout={onListContainerLayout}>
      <DraggableFlatList
        activationDistance={20}
        autoscrollSpeed={50}
        scrollEnabled={false}
        {...props}
        outerScrollOffset={outerScrollOffset}
        onDragBegin={(...args) => {
          setOuterScrollEnabled(false);
          props.onDragBegin?.(...args);
        }}
        onDragEnd={(...args) => {
          props.onDragEnd?.(...args);
          setOuterScrollEnabled(true);
        }}
        onAnimValInit={(animVals) => {
          setAnimVals({
            ...animVals,
            hoverAnim: hoverAnimWithOffset,
          });
          props.onAnimValInit?.(animVals);
        }}
      />
    </Animated.View>
  );
}
