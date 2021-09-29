import React, { useContext, useEffect } from "react";
import { useMemo, useRef } from "react";
import { FlatList, PanGestureHandler } from "react-native-gesture-handler";
import Animated from "react-native-reanimated";
import { DEFAULT_PROPS } from "../constants";
import { useProps } from "./PropsContext";
import { useAnimatedValues } from "./AnimatedValueContext";
import { CellData, DraggableFlatListProps } from "../types";

type RefContextValue<T> = {
  propsRef: React.MutableRefObject<DraggableFlatListProps<T>>;
  animationConfigRef: React.MutableRefObject<Animated.SpringConfig>;
  cellDataRef: React.MutableRefObject<Map<string, CellData>>;
  keyToIndexRef: React.MutableRefObject<Map<string, number>>;
  containerRef: React.RefObject<Animated.View>;
  flatlistRef: React.RefObject<FlatList<T>>;
  panGestureHandlerRef: React.RefObject<PanGestureHandler>;
  scrollOffsetRef: React.MutableRefObject<number>;
  isTouchActiveRef: React.MutableRefObject<{
    native: Animated.Value<number>;
    js: boolean;
  }>;
};
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
  const { onRef, animationConfig = DEFAULT_PROPS.animationConfig } = props;

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
  const flatlistRef = useRef<FlatList<T>>(null);
  const panGestureHandlerRef = useRef<PanGestureHandler>(null);
  const scrollOffsetRef = useRef(0);
  const isTouchActiveRef = useRef({
    native: isTouchActiveNative,
    js: false,
  });

  useEffect(() => {
    if (flatlistRef.current) onRef?.(flatlistRef.current);
  }, [onRef]);

  const refs = useMemo(
    () => ({
      animationConfigRef,
      cellDataRef,
      containerRef,
      flatlistRef,
      isTouchActiveRef,
      keyToIndexRef,
      panGestureHandlerRef,
      propsRef,
      scrollOffsetRef,
    }),
    []
  );

  return refs;
}
