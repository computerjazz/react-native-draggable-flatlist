import React, { useRef, useState } from "react";
import { findNodeHandle, LogBox } from "react-native";
import Animated, {
  useDerivedValue,
  useSharedValue,
} from "react-native-reanimated";
import { DraggableFlatListProps } from "../types";
import DraggableFlatList from "../components/DraggableFlatList";
import { useSafeNestableScrollContainerContext } from "../context/nestableScrollContainerContext";
import { useNestedAutoScroll } from "../hooks/useNestedAutoScroll";
import { typedMemo } from "../utils";
import { useIdentityRetainingCallback } from "../hooks/useIdentityRetainingCallback";

function NestableDraggableFlatListInner<T>(props: DraggableFlatListProps<T>) {
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
    scrollableRef,
    outerScrollOffset,
    setOuterScrollEnabled,
  } = useSafeNestableScrollContainerContext();

  const listVerticalOffset = useSharedValue(0);
  const viewRef = useRef<Animated.View>(null);
  const [animVals, setAnimVals] = useState({});
  const defaultHoverOffset = useSharedValue(0);
  const [listHoverOffset, setListHoverOffset] = useState(defaultHoverOffset);

  const hoverOffset = useDerivedValue(() => {
    return listHoverOffset.value + listVerticalOffset.value;
  }, [listHoverOffset]);

  useNestedAutoScroll({
    ...animVals,
    hoverOffset,
  });

  const onListContainerLayout = useIdentityRetainingCallback(async () => {
    const viewNode = viewRef.current;
    const nodeHandle = findNodeHandle(scrollableRef.current);

    const onSuccess = (_x: number, y: number) => {
      listVerticalOffset.value = y;
    };
    const onFail = () => {
      console.log("## nested draggable list measure fail");
    };
    //@ts-ignore
    viewNode.measureLayout(nodeHandle, onSuccess, onFail);
  });

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
          setListHoverOffset(animVals.hoverOffset);
          setAnimVals({
            ...animVals,
            hoverOffset,
          });
          props.onAnimValInit?.(animVals);
        }}
      />
    </Animated.View>
  );
}

export const NestableDraggableFlatList = typedMemo(
  NestableDraggableFlatListInner
);
