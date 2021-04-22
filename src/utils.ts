import React, { useRef } from "react";
import Animated from "react-native-reanimated";

// Fixes bug with useMemo + generic types:
// https://github.com/DefinitelyTyped/DefinitelyTyped/issues/37087#issuecomment-542793243
export const typedMemo: <T>(c: T) => T = React.memo;

export function useNode<T>(node: Animated.Node<T>) {
  const ref = useRef<Animated.Node<T> | null>(null);
  if (ref.current === null) {
    ref.current = node;
  }
  return ref.current;
}
