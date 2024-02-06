import React, { useContext, useMemo } from "react";
import { typedMemo } from "../utils";
const CellContext = /*#__PURE__*/ React.createContext(undefined);
export function CellProvider(_ref) {
  let { isActive, children } = _ref;
  const value = useMemo(
    () => ({
      isActive,
    }),
    [isActive]
  );
  return /*#__PURE__*/ React.createElement(
    CellContext.Provider,
    {
      value: value,
    },
    children
  );
}
export default typedMemo(CellProvider);
export function useIsActive() {
  const value = useContext(CellContext);

  if (!value) {
    throw new Error("useIsActive must be called from within CellProvider!");
  }

  return value.isActive;
}
//# sourceMappingURL=cellContext.js.map
