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

import React, { useEffect, useMemo, useRef } from "react";
import { findNodeHandle, StyleSheet } from "react-native";
import Animated, {
  runOnUI,
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
import { useStableCallback } from "../hooks/useStableCallback";

function CellRendererComponent(props) {
  const { item, index, onLayout, children, ...rest } = props;
  const viewRef = useRef(null);
  const { cellDataRef, propsRef, containerRef } = useRefs();
  const { horizontalAnim, scrollOffset } = useAnimatedValues();
  const {
    activeKey,
    keyExtractor,
    horizontal,
    layoutAnimationDisabled,
  } = useDraggableFlatListContext();
  const key = keyExtractor(item, index);
  const offset = useSharedValue(-1);
  const size = useSharedValue(-1);
  const heldTanslate = useSharedValue(0);
  const translate = useCellTranslate({
    cellOffset: offset,
    cellSize: size,
    cellIndex: index,
  });
  const isActive = activeKey === key;
  const animStyle = useAnimatedStyle(() => {
    // When activeKey becomes null at the end of a drag and the list reorders,
    // the animated style may apply before the next paint, causing a flicker.
    // Solution is to hold over the last animated value until the next onLayout.
    // (Not required in web)
    if (translate.value && !isWeb) {
      heldTanslate.value = translate.value;
    }

    const t = activeKey ? translate.value : heldTanslate.value;
    return {
      transform: [
        horizontalAnim.value
          ? {
              translateX: t,
            }
          : {
              translateY: t,
            },
      ],
    };
  }, [translate, activeKey]);
  const updateCellMeasurements = useStableCallback(() => {
    const onSuccess = (x, y, w, h) => {
      if (isWeb && horizontal) x += scrollOffset.value;
      const cellOffset = horizontal ? x : y;
      const cellSize = horizontal ? w : h;
      cellDataRef.current.set(key, {
        measurements: {
          size: cellSize,
          offset: cellOffset,
        },
      });
      size.value = cellSize;
      offset.value = cellOffset;
    };

    const onFail = () => {
      var _propsRef$current;

      if (
        (_propsRef$current = propsRef.current) !== null &&
        _propsRef$current !== void 0 &&
        _propsRef$current.debug
      ) {
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
  const onCellLayout = useStableCallback((e) => {
    heldTanslate.value = 0;
    updateCellMeasurements();
    if (onLayout && e) onLayout(e);
  });
  useEffect(() => {
    if (isWeb) {
      // onLayout isn't called on web when the cell index changes, so we manually re-measure
      requestAnimationFrame(() => {
        onCellLayout();
      });
    }
  }, [index, onCellLayout]);
  const baseStyle = useMemo(() => {
    return {
      elevation: isActive ? 1 : 0,
      zIndex: isActive ? 999 : 0,
      flexDirection: horizontal ? "row" : "column",
    };
  }, [isActive, horizontal]);
  const {
    itemEnteringAnimation,
    itemExitingAnimation,
    itemLayoutAnimation,
  } = propsRef.current;
  useEffect(() => {
    // NOTE: Keep an eye on reanimated LayoutAnimation refactor:
    // https://github.com/software-mansion/react-native-reanimated/pull/3332/files
    // We might have to change the way we register/unregister LayouAnimations:
    // - get native module: https://github.com/software-mansion/react-native-reanimated/blob/cf59766460d05eb30357913455318d8a95909468/src/reanimated2/NativeReanimated/NativeReanimated.ts#L18
    // - register layout animation for tag: https://github.com/software-mansion/react-native-reanimated/blob/cf59766460d05eb30357913455318d8a95909468/src/reanimated2/NativeReanimated/NativeReanimated.ts#L99
    if (!propsRef.current.enableLayoutAnimationExperimental) return;
    const tag = findNodeHandle(viewRef.current);
    runOnUI((t, _layoutDisabled) => {
      "worklet";

      if (!t) return;
      const config = global.LayoutAnimationRepository.configs[t];
      if (config) stashConfig(t, config);
      const stashedConfig = getStashedConfig(t);

      if (_layoutDisabled) {
        global.LayoutAnimationRepository.removeConfig(t);
      } else if (stashedConfig) {
        global.LayoutAnimationRepository.registerConfig(t, stashedConfig);
      }
    })(tag, layoutAnimationDisabled);
  }, [layoutAnimationDisabled]);
  return /*#__PURE__*/ React.createElement(
    Animated.View,
    _extends({}, rest, {
      ref: viewRef,
      onLayout: onCellLayout,
      entering: itemEnteringAnimation,
      exiting: itemExitingAnimation,
      layout: propsRef.current.enableLayoutAnimationExperimental
        ? itemLayoutAnimation
        : undefined,
      style: [
        props.style,
        baseStyle,
        activeKey ? animStyle : styles.zeroTranslate,
      ],
      pointerEvents: activeKey ? "none" : "auto",
    }),
    /*#__PURE__*/ React.createElement(
      CellProvider,
      {
        isActive: isActive,
      },
      children
    )
  );
}

export default typedMemo(CellRendererComponent);
const styles = StyleSheet.create({
  zeroTranslate: {
    transform: [
      {
        translateX: 0,
      },
      {
        translateY: 0,
      },
    ],
  },
});
runOnUI(() => {
  "worklet";

  global.RNDFLLayoutAnimationConfigStash = {};
})();

function stashConfig(tag, config) {
  "worklet";

  if (!global.RNDFLLayoutAnimationConfigStash)
    global.RNDFLLayoutAnimationConfigStash = {};
  global.RNDFLLayoutAnimationConfigStash[tag] = config;
}

function getStashedConfig(tag) {
  "worklet";

  if (!global.RNDFLLayoutAnimationConfigStash) return null;
  return global.RNDFLLayoutAnimationConfigStash[tag];
}
//# sourceMappingURL=CellRendererComponent.js.map
