import React, { useContext, useMemo, useRef, useState } from "react";
import { ScrollView } from "react-native-gesture-handler";
import Animated, { useSharedValue } from "react-native-reanimated";

type NestableScrollContainerContextVal = ReturnType<
  typeof useSetupNestableScrollContextValue
>;
const NestableScrollContainerContext = React.createContext<
  NestableScrollContainerContextVal | undefined
>(undefined);

function useSetupNestableScrollContextValue({
  forwardedRef,
}: {
  forwardedRef?: React.MutableRefObject<ScrollView>;
}) {
  const [outerScrollEnabled, setOuterScrollEnabled] = useState(true);
  const scrollViewSize = useSharedValue(0);
  const scrollableRefInner = useRef<ScrollView>(null);
  const scrollableRef = forwardedRef || scrollableRefInner;
  const outerScrollOffset = useSharedValue(0);
  const containerSize = useSharedValue(0);

  const contextVal = useMemo(
    () => ({
      outerScrollEnabled,
      setOuterScrollEnabled,
      outerScrollOffset,
      scrollViewSize,
      scrollableRef,
      containerSize,
    }),
    [outerScrollEnabled]
  );

  return contextVal;
}

export function NestableScrollContainerProvider({
  children,
  forwardedRef,
}: {
  children: React.ReactNode;
  forwardedRef?: React.MutableRefObject<ScrollView>;
}) {
  const contextVal = useSetupNestableScrollContextValue({ forwardedRef });
  return (
    <NestableScrollContainerContext.Provider value={contextVal}>
      {children}
    </NestableScrollContainerContext.Provider>
  );
}

export function useNestableScrollContainerContext() {
  const value = useContext(NestableScrollContainerContext);
  return value;
}

export function useSafeNestableScrollContainerContext() {
  const value = useNestableScrollContainerContext();
  if (!value) {
    throw new Error(
      "useSafeNestableScrollContainerContext must be called within a NestableScrollContainerContext.Provider"
    );
  }
  return value;
}
