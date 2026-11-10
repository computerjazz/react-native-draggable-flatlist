import React, { useContext, useMemo, useRef, useState } from "react";
import { ScrollView } from "react-native-gesture-handler";
import Animated, { useSharedValue } from "react-native-reanimated";

type NestableScrollContainerContextVal = ReturnType<
  typeof useSetupNestableScrollContextValue
>["contextVal"];
const NestableScrollContainerContext = React.createContext<
  NestableScrollContainerContextVal | undefined
>(undefined);

// Kept out of the context above: every nested list consumes that one, and the
// outer scroll is toggled when each drag starts and ends, which would
// otherwise re-render every nested list and all of its cells twice per drag.
const OuterScrollEnabledContext = React.createContext(true);

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
      setOuterScrollEnabled,
      outerScrollOffset,
      scrollViewSize,
      scrollableRef,
      containerSize,
    }),
    [scrollableRef]
  );

  return { contextVal, outerScrollEnabled };
}

export function NestableScrollContainerProvider({
  children,
  forwardedRef,
}: {
  children: React.ReactNode;
  forwardedRef?: React.MutableRefObject<ScrollView>;
}) {
  const {
    contextVal,
    outerScrollEnabled,
  } = useSetupNestableScrollContextValue({ forwardedRef });
  return (
    <NestableScrollContainerContext.Provider value={contextVal}>
      <OuterScrollEnabledContext.Provider value={outerScrollEnabled}>
        {children}
      </OuterScrollEnabledContext.Provider>
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

export function useOuterScrollEnabled() {
  return useContext(OuterScrollEnabledContext);
}
