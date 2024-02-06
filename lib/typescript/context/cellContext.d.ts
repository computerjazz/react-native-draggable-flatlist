import React from "react";
declare type Props = {
  isActive: boolean;
  children: React.ReactNode;
};
export declare function CellProvider({
  isActive,
  children,
}: Props): JSX.Element;
declare const _default: typeof CellProvider;
export default _default;
export declare function useIsActive(): boolean;
