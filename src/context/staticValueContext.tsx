import React, { useContext, useMemo } from "react"
import Animated from "react-native-reanimated"
import { FlatList } from "react-native-gesture-handler"
import { DraggableFlatListProps } from "../types";

export type StaticContextValue<T> = {
  cellDataRef: React.MutableRefObject<Map<string, any>>;
  keyToIndexRef: React.MutableRefObject<Map<string, number>>;
  activeIndexAnim: Animated.SharedValue<number>;
  spacerIndexAnim: Animated.SharedValue<number>;
  hoverComponentTranslate: Animated.SharedValue<number>;
  hoverOffset: Animated.SharedValue<number>;
  activeCellSize: Animated.SharedValue<number>;
  activeCellOffset: Animated.SharedValue<number>;
  scrollOffset: Animated.SharedValue<number>;
  placeholderOffset: Animated.SharedValue<number>;
  placeholderScreenOffset: Animated.SharedValue<number>;
  horizontalAnim: Animated.SharedValue<boolean>;
  isHovering: Animated.SharedValue<boolean>;
  animationConfigRef: React.MutableRefObject<Animated.WithSpringConfig>;
  keyExtractor: (item: T, index: number) => string;
  flatlistRef: React.RefObject<FlatList<T>>;
  propsRef: React.MutableRefObject<DraggableFlatListProps<T>>
};


// context to hold values that remain referentially equal
const StaticContext = React.createContext<StaticContextValue<any> | undefined>(
  undefined
);

export function StaticValueProvider<T>({ children, ...rest }: StaticContextValue<T> & { children: React.ReactNode }) {

  const {
    activeIndexAnim,
    spacerIndexAnim,
    hoverOffset,
    horizontalAnim,
    keyToIndexRef,
    cellDataRef,
    activeCellSize,
    activeCellOffset,
    scrollOffset,
    isHovering,
    animationConfigRef,
    placeholderOffset,
    placeholderScreenOffset,
    flatlistRef,
    keyExtractor,
    hoverComponentTranslate,
    propsRef,
  } = rest

  const staticValue = useMemo(() => {
    return {
      activeIndexAnim,
      spacerIndexAnim,
      hoverOffset,
      horizontalAnim,
      keyToIndexRef,
      cellDataRef,
      activeCellSize,
      activeCellOffset,
      scrollOffset,
      isHovering,
      animationConfigRef,
      placeholderOffset,
      placeholderScreenOffset,
      flatlistRef,
      keyExtractor,
      hoverComponentTranslate,
      propsRef,
    };
  }, [
    activeIndexAnim,
    horizontalAnim,
    spacerIndexAnim,
    hoverOffset,
    activeCellSize,
    activeCellOffset,
    scrollOffset,
    isHovering,
    animationConfigRef,
    placeholderOffset,
    placeholderScreenOffset,
    flatlistRef,
    keyExtractor,
    cellDataRef,
    keyToIndexRef,
    hoverComponentTranslate,
  ]);

  return (
    <StaticContext.Provider value={staticValue}>
      {children}
    </StaticContext.Provider>
  )
}

export function useStaticValues<T>() {
  const value = useContext(StaticContext) as StaticContextValue<T>;
  if (!value) {
    throw new Error(
      "useStaticValues must be called within StaticContext.Provider"
    );
  }
  return value;
}
