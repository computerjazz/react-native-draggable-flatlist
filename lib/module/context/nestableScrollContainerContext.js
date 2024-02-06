import React, { useContext, useMemo, useRef, useState } from "react";
import { useSharedValue } from "react-native-reanimated";
const NestableScrollContainerContext = /*#__PURE__*/ React.createContext(
  undefined
);

function useSetupNestableScrollContextValue(_ref) {
  let { forwardedRef } = _ref;
  const [outerScrollEnabled, setOuterScrollEnabled] = useState(true);
  const scrollViewSize = useSharedValue(0);
  const scrollableRefInner = useRef(null);
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

export function NestableScrollContainerProvider(_ref2) {
  let { children, forwardedRef } = _ref2;
  const contextVal = useSetupNestableScrollContextValue({
    forwardedRef,
  });
  return /*#__PURE__*/ React.createElement(
    NestableScrollContainerContext.Provider,
    {
      value: contextVal,
    },
    children
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
//# sourceMappingURL=nestableScrollContainerContext.js.map
