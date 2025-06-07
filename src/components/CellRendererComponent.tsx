import React, { useEffect, useMemo, useRef } from "react";
import {
  findNodeHandle,
  LayoutChangeEvent,
  MeasureLayoutOnSuccessCallback,
  StyleProp,
  ViewStyle,
} from "react-native";
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

type Props<T> = {
  item: T;
  index: number;
  children: React.ReactNode;
  onLayout?: (e: LayoutChangeEvent) => void;
  style?: StyleProp<ViewStyle>;
};

function CellRendererComponent<T>(props: Props<T>) {
  const { item, index, onLayout, children, ...rest } = props;

  const viewRef = useRef<Animated.View>(null);
  const { cellDataRef, propsRef, containerRef } = useRefs<T>();

  const { horizontalAnim, scrollOffset } = useAnimatedValues();
  const {
    activeKey,
    keyExtractor,
    horizontal,
    layoutAnimationDisabled,
  } = useDraggableFlatListContext<T>();

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
    if (translate.value && !isWeb) {
      heldTanslate.value = translate.value;
    }
    const t = activeKey ? translate.value : heldTanslate.value;
    return {
      transform: [horizontalAnim.value ? { translateX: t } : { translateY: t }],
    };
  }, [translate, activeKey]);

  const updateCellMeasurements = useStableCallback(() => {
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

  const onCellLayout = useStableCallback((e?: LayoutChangeEvent) => {
    heldTanslate.value = 0;
    updateCellMeasurements();
    if (onLayout && e) onLayout(e);
  });

  useEffect(() => {
    if (isWeb) {
      requestAnimationFrame(() => {
        onCellLayout();
      });
    }
  }, [index, onCellLayout]);

  const baseStyle = useMemo(() => {
    return {
      elevation: isActive ? 1 : 0,
      zIndex: isActive ? 999 : 0,
      flexDirection: horizontal ? ("row" as const) : ("column" as const),
    };
  }, [isActive, horizontal]);

  const {
    itemEnteringAnimation,
    itemExitingAnimation,
    itemLayoutAnimation,
  } = propsRef.current;

  useEffect(() => {
    if (!propsRef.current.enableLayoutAnimationExperimental) return;
    const tag = findNodeHandle(viewRef.current);

    runOnUI((t: number | null, _layoutDisabled: boolean) => {
      'worklet';
      if (!t) return;
      const config = global.LayoutAnimationRepository?.configs?.[t];
      if (config) stashConfig(t, config);
      const stashedConfig = getStashedConfig(t);
      if (_layoutDisabled) {
        global.LayoutAnimationRepository?.removeConfig?.(t);
      } else if (stashedConfig) {
        global.LayoutAnimationRepository?.registerConfig?.(t, stashedConfig);
      }
    })(tag, layoutAnimationDisabled);
  }, [layoutAnimationDisabled]);

  return (
    <Animated.View
      {...rest}
      ref={viewRef}
      onLayout={onCellLayout}
      entering={itemEnteringAnimation}
      exiting={itemExitingAnimation}
      layout={
        propsRef.current.enableLayoutAnimationExperimental
          ? itemLayoutAnimation
          : undefined
      }
      style={[props.style, baseStyle, animStyle]}
      pointerEvents={activeKey ? "none" : "auto"}
    >
      <CellProvider isActive={isActive}>{children}</CellProvider>
    </Animated.View>
  );
}

export default typedMemo(CellRendererComponent);

declare global {
  namespace NodeJS {
    interface Global {
      RNDFLLayoutAnimationConfigStash: Record<string, unknown>;
      LayoutAnimationRepository: {
        configs: Record<string, unknown>;
        removeConfig: (tag: number) => void;
        registerConfig: (tag: number, config: unknown) => void;
      };
    }
  }
  var RNDFLLayoutAnimationConfigStash: Record<string, unknown>;
  var LayoutAnimationRepository: {
    configs: Record<string, unknown>;
    removeConfig: (tag: number) => void;
    registerConfig: (tag: number, config: unknown) => void;
  };
}

runOnUI(() => {
  'worklet';
  if (typeof global !== 'undefined') {
    global.RNDFLLayoutAnimationConfigStash = global.RNDFLLayoutAnimationConfigStash || {};
  }
})();

function stashConfig(tag: number, config: unknown) {
  'worklet';
  if (typeof global !== 'undefined') {
    if (!global.RNDFLLayoutAnimationConfigStash)
      global.RNDFLLayoutAnimationConfigStash = {};
    global.RNDFLLayoutAnimationConfigStash[tag] = config;
  }
}

function getStashedConfig(tag: number) {
  'worklet';
  if (typeof global !== 'undefined' && global.RNDFLLayoutAnimationConfigStash) {
    return global.RNDFLLayoutAnimationConfigStash[tag] as Record<string, unknown>;
  }
  return null;
}