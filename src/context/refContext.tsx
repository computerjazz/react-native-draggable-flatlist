import React, { useContext } from "react";
import { useMemo, useRef } from "react";
import { FlatList, PanGestureHandler } from "react-native-gesture-handler";
import Animated from "react-native-reanimated";
import { DEFAULT_PROPS } from "../constants";
import { useProps } from "./propsContext";
import { CellData } from "../types";
import { useAnimatedValues } from "./animatedValueContext";

type RefContextValue<T> = ReturnType<typeof useSetupRefs>;
const RefContext = React.createContext<RefContextValue<any> | undefined>(
  undefined
);

export default function RefProvider<T>({
  children,
}: {
  children: React.ReactNode;
}) {
  const value = useSetupRefs<T>();
  return <RefContext.Provider value={value}>{children}</RefContext.Provider>;
}

export function useRefs<T>() {
  const value = useContext(RefContext);
  if (!value) {
    throw new Error(
      "useRefs must be called from within a RefContext.Provider!"
    );
  }
  return value as RefContextValue<T>;
}

function useSetupRefs<T>() {
  const props = useProps<T>();
  const { animationConfig = DEFAULT_PROPS.animationConfig } = props;

  const { isTouchActiveNative } = useAnimatedValues();

  const propsRef = useRef(props);
  propsRef.current = props;
  const animConfig = {
    ...DEFAULT_PROPS.animationConfig,
    ...animationConfig,
  } as Animated.SpringConfig;
  const animationConfigRef = useRef(animConfig);
  animationConfigRef.current = animConfig;

  const cellDataRef = useRef(new Map<string, CellData>());
  const keyToIndexRef = useRef(new Map<string, number>());
  const containerRef = useRef<Animated.View>(null);
  const flatlistRef = useRef<FlatList<T>>();
  const panGestureHandlerRef = useRef<PanGestureHandler>(null);
  const scrollOffsetRef = useRef(0);
  const isTouchActiveRef = useRef({
    native: isTouchActiveNative,
    js: false,
  });

  const refs = useMemo(
    () => ({
      propsRef,
      animationConfigRef,
      cellDataRef,
      keyToIndexRef,
      containerRef,
      flatlistRef,
      panGestureHandlerRef,
      scrollOffsetRef,
      isTouchActiveRef,
    }),
    []
  );

  return refs;
}
