import React, { useMemo, useRef, useState } from "react";
import { findNodeHandle, LogBox } from "react-native";
import Animated, { add } from "react-native-reanimated";
import { DraggableFlatListProps } from "../types";
import DraggableFlatList from "../components/DraggableFlatList";
import { useNestableScrollContainerContext } from "../context/nestableScrollContainerContext";
import { useNestedAutoScroll } from "../hooks/useNestedAutoScroll";
import { FlatList } from "react-native-gesture-handler";

export function NestableDraggableFlatListInner<T>(
  props: DraggableFlatListProps<T>,
  ref?: React.ForwardedRef<FlatList<T>>
) {
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

  const listVerticalOffset = useMemo(() => new Animated.Value<number>(0), []);
  const viewRef = useRef<Animated.View>(null);
  const [animVals, setAnimVals] = useState({});

  useNestedAutoScroll(animVals);

  const onListContainerLayout = async () => {
    const viewNode = viewRef.current;
    const nodeHandle = findNodeHandle(containerRef.current);

    const onSuccess = (_x: number, y: number) => {
      listVerticalOffset.setValue(y);
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
        ref={ref}
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
            hoverAnim: add(animVals.hoverAnim, listVerticalOffset),
          });
          props.onAnimValInit?.(animVals);
        }}
      />
    </Animated.View>
  );
}

// Generic forwarded ref type assertion taken from:
// https://fettblog.eu/typescript-react-generic-forward-refs/#option-1%3A-type-assertion
export const NestableDraggableFlatList = React.forwardRef(
  NestableDraggableFlatListInner
) as <T>(
  props: DraggableFlatListProps<T> & { ref?: React.ForwardedRef<FlatList<T>> }
) => ReturnType<typeof NestableDraggableFlatListInner>;
