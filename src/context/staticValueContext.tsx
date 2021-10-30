import React, { useContext, useMemo } from "react";
import Animated from "react-native-reanimated";
import { FlatList, ScrollView } from "react-native-gesture-handler";
import { DraggableFlatListProps } from "../types";

export type StaticContextValue<T> = {
  activeCellOffset: Animated.SharedValue<number>;
  activeCellSize: Animated.SharedValue<number>;
  activeIndexAnim: Animated.SharedValue<number>;
  animationConfigRef: React.MutableRefObject<Animated.WithSpringConfig>;
  cellDataRef: React.MutableRefObject<Map<string, any>>;
  flatlistRef: React.RefObject<FlatList<T>>;
  horizontalAnim: Animated.SharedValue<boolean>;
  hoverComponentTranslate: Animated.SharedValue<number>;
  hoverOffset: Animated.SharedValue<number>;
  isHovering: Animated.SharedValue<boolean>;
  isPressedIn: Animated.SharedValue<boolean>;
  keyExtractor: (item: T, index: number) => string;
  keyToIndexRef: React.MutableRefObject<Map<string, number>>;
  placeholderOffset: Animated.SharedValue<number>;
  placeholderScreenOffset: Animated.SharedValue<number>;
  propsRef: React.MutableRefObject<DraggableFlatListProps<T>>;
  scrollOffset: Animated.SharedValue<number>;
  spacerIndexAnim: Animated.SharedValue<number>;
  scrollViewSize: Animated.SharedValue<number>;
  containerSize: Animated.SharedValue<number>;
  scrollViewRef: React.RefObject<ScrollView>;
};

// context to hold values that remain referentially equal
const StaticContext = React.createContext<StaticContextValue<any> | undefined>(
  undefined
);

export function StaticValueProvider<T>({
  children,
  ...rest
}: StaticContextValue<T> & { children: React.ReactNode }) {
  const staticValue = useMemo(() => {
    return {
      ...rest,
    };
  }, Object.values(rest));

  return (
    <StaticContext.Provider value={staticValue}>
      {children}
    </StaticContext.Provider>
  );
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
