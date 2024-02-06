import React, { useContext } from "react";
const PropsContext = /*#__PURE__*/ React.createContext(undefined);
export default function PropsProvider(_ref) {
  let { children, ...props } = _ref;
  return /*#__PURE__*/ React.createElement(
    PropsContext.Provider,
    {
      value: props,
    },
    children
  );
}
export function useProps() {
  const value = useContext(PropsContext);

  if (!value) {
    throw new Error("useProps must be called from within PropsProvider!");
  }

  return value;
}
//# sourceMappingURL=propsContext.js.map
