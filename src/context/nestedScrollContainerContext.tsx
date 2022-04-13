import React, { useContext, useMemo, useRef, useState } from "react";
import { ScrollView } from "react-native-gesture-handler";
import Animated from "react-native-reanimated";

type NestedScrollContainerContextVal = ReturnType<
  typeof useSetupNestedScrollContextValue
>;
const NestedScrollContainerContext = React.createContext<
  NestedScrollContainerContextVal | undefined
>(undefined);

function useSetupNestedScrollContextValue() {
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

export function NestedScrollContainerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const contextVal = useSetupNestedScrollContextValue();
  return (
    <NestedScrollContainerContext.Provider value={contextVal}>
      {children}
    </NestedScrollContainerContext.Provider>
  );
}

export function useNestedScrollContainerContext() {
  const value = useContext(NestedScrollContainerContext);
  if (!value) {
    throw new Error(
      "useNestedScrollContainerContext must be called from within NestedScrollContainerContext Provider!"
    );
  }
  return value;
}
