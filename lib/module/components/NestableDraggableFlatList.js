function _extends() {
  _extends =
    Object.assign ||
    function (target) {
      for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i];
        for (var key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = source[key];
          }
        }
      }
      return target;
    };
  return _extends.apply(this, arguments);
}

import React, { useRef, useState } from "react";
import { findNodeHandle, LogBox } from "react-native";
import { useDerivedValue, useSharedValue } from "react-native-reanimated";
import DraggableFlatList from "../components/DraggableFlatList";
import { useSafeNestableScrollContainerContext } from "../context/nestableScrollContainerContext";
import { useNestedAutoScroll } from "../hooks/useNestedAutoScroll";
import { useStableCallback } from "../hooks/useStableCallback";

function NestableDraggableFlatListInner(props, ref) {
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
  const [animVals, setAnimVals] = useState({});
  const defaultHoverOffset = useSharedValue(0);
  const [listHoverOffset, setListHoverOffset] = useState(defaultHoverOffset);
  const hoverOffset = useDerivedValue(() => {
    return listHoverOffset.value + listVerticalOffset.value;
  }, [listHoverOffset]);
  useNestedAutoScroll({ ...animVals, hoverOffset });
  const onListContainerLayout = useStableCallback(async (_ref) => {
    let { containerRef } = _ref;
    const nodeHandle = findNodeHandle(scrollableRef.current);

    const onSuccess = (_x, y) => {
      listVerticalOffset.value = y;
    };

    const onFail = () => {
      console.log("## nested draggable list measure fail");
    }; //@ts-ignore

    containerRef.current.measureLayout(nodeHandle, onSuccess, onFail);
  });
  const onDragBegin = useStableCallback((params) => {
    var _props$onDragBegin;

    setOuterScrollEnabled(false);
    (_props$onDragBegin = props.onDragBegin) === null ||
    _props$onDragBegin === void 0
      ? void 0
      : _props$onDragBegin.call(props, params);
  });
  const onDragEnd = useStableCallback((params) => {
    var _props$onDragEnd;

    setOuterScrollEnabled(true);
    (_props$onDragEnd = props.onDragEnd) === null || _props$onDragEnd === void 0
      ? void 0
      : _props$onDragEnd.call(props, params);
  });
  const onAnimValInit = useStableCallback((params) => {
    var _props$onAnimValInit;

    setListHoverOffset(params.hoverOffset);
    setAnimVals({ ...params, hoverOffset });
    (_props$onAnimValInit = props.onAnimValInit) === null ||
    _props$onAnimValInit === void 0
      ? void 0
      : _props$onAnimValInit.call(props, params);
  });
  return /*#__PURE__*/ React.createElement(
    DraggableFlatList,
    _extends(
      {
        ref: ref,
        onContainerLayout: onListContainerLayout,
        activationDistance: props.activationDistance || 20,
        scrollEnabled: false,
      },
      props,
      {
        outerScrollOffset: outerScrollOffset,
        onDragBegin: onDragBegin,
        onDragEnd: onDragEnd,
        onAnimValInit: onAnimValInit,
      }
    )
  );
} // Generic forwarded ref type assertion taken from:
// https://fettblog.eu/typescript-react-generic-forward-refs/#option-1%3A-type-assertion

export const NestableDraggableFlatList = /*#__PURE__*/ React.forwardRef(
  NestableDraggableFlatListInner
);
//# sourceMappingURL=NestableDraggableFlatList.js.map
