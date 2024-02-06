import { useRef, useCallback } from "react"; // Utility hook that returns a function that never has stale dependencies, but
// without changing identity, as a useCallback with dep array would.
// Useful for functions that depend on external state, but
// should not trigger effects when that external state changes.

export function useStableCallback(cb) {
  const cbRef = useRef(cb);
  cbRef.current = cb;
  const identityRetainingCb = useCallback(function () {
    return cbRef.current(...arguments);
  }, []);
  return identityRetainingCb;
}
//# sourceMappingURL=useStableCallback.js.map
