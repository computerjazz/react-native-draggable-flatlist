import { useRef, useCallback } from "react";

// Utility hook that returns a function that never has stale dependencies, but
// without changing identity, as a useCallback with dep array would.
// Useful for functions that depend on external state, but
// should not trigger effects when that external state changes.

export function useIdentityRetainingCallback<
  T extends (a?: any, b?: any, c?: any) => any
>(fn: T) {
  const fnRef = useRef(fn);
  fnRef.current = fn;
  const identityRetainingFn = useCallback(
    (...args: Parameters<T>) => fnRef.current(...args),
    []
  );
  return identityRetainingFn as T;
}
