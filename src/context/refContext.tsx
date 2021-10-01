import React, { useContext, useEffect } from "react";
import { useMemo, useRef } from "react";
import {
  FlatList,
  PanGestureHandler,
  ScrollView,
} from "react-native-gesture-handler";
import Animated, { useAnimatedRef } from "react-native-reanimated";
import { DEFAULT_PROPS } from "../constants";
import { useProps } from "./propsContext";
import { useAnimatedValues } from "./animatedValueContext";
import { CellData, DraggableFlatListProps } from "../types";

type RefContextValue<T> = {
  propsRef: React.MutableRefObject<DraggableFlatListProps<T>>;
  animationConfigRef: React.MutableRefObject<Animated.WithSpringConfig>;
  cellDataRef: React.MutableRefObject<Map<string, CellData>>;
  keyToIndexRef: React.MutableRefObject<Map<string, number>>;
  containerRef: React.RefObject<Animated.View>;
  flatlistRef: React.RefObject<FlatList<T>>;
  scrollViewRef: React.RefObject<Animated.ScrollView>;
  scrollOffsetRef: React.MutableRefObject<number>;
  isTouchActiveRef: React.MutableRefObject<{
    native: Animated.SharedValue<number>;
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
  } as Animated.WithSpringConfig;
  const animationConfigRef = useRef(animConfig);
  animationConfigRef.current = animConfig;

  const cellDataRef = useRef(new Map<string, CellData>());
  const keyToIndexRef = useRef(new Map<string, number>());
  const containerRef = useAnimatedRef<Animated.View>();
  const flatlistRef = useAnimatedRef<FlatList<T>>();
  const scrollViewRef = useAnimatedRef<Animated.ScrollView>();

  const scrollOffsetRef = useRef(0);
  const isTouchActiveRef = useRef({
    native: isTouchActiveNative,
    js: false,
  });

  useEffect(() => {
    // This is a workaround for the fact that RN does not respect refs passed in
    // to renderScrollViewComponent underlying ScrollView
    //@ts-ignore
    const scrollRef = flatlistRef.current?.getNativeScrollRef();
    if (!scrollViewRef.current) {
      //@ts-ignore
      scrollViewRef(scrollRef);
    }
  }, []);

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
      propsRef,
      scrollOffsetRef,
      scrollViewRef,
    }),
    []
  );

  return refs;
}
