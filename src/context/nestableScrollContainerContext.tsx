import React, { useContext, useMemo, useRef, useState } from "react";
import { ScrollView } from "react-native-gesture-handler";
import Animated from "react-native-reanimated";

type NestableScrollContainerContextVal = ReturnType<
  typeof useSetupNestableScrollContextValue
>;
const NestableScrollContainerContext = React.createContext<
  NestableScrollContainerContextVal | undefined
>(undefined);

function useSetupNestableScrollContextValue() {
  const [outerScrollEnabled, setOuterScrollEnabled] = useState(true);
  const scrollViewSize = useMemo(() => new Animated.Value<number>(0), []);
  const scrollableRef = useRef<ScrollView>(null);
  const outerScrollOffset = useMemo(() => new Animated.Value<number>(0), []);
  const containerRef = useRef<Animated.View>(null);
  const containerSize = useMemo(() => new Animated.Value<number>(0), []);

  const contextVal = useMemo(
    () => ({
      outerScrollEnabled,
      setOuterScrollEnabled,
      outerScrollOffset,
      scrollViewSize,
      scrollableRef,
      containerRef,
      containerSize,
    }),
    [outerScrollEnabled]
  );

  return contextVal;
}

export function NestableScrollContainerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const contextVal = useSetupNestableScrollContextValue();
  return (
    <NestableScrollContainerContext.Provider value={contextVal}>
      {children}
    </NestableScrollContainerContext.Provider>
  );
}

export function useNestableScrollContainerContext() {
  const value = useContext(NestableScrollContainerContext);
  if (!value) {
    throw new Error(
      "useNestableScrollContainerContext must be called from within NestableScrollContainerContext Provider!"
    );
  }
  return value;
}
