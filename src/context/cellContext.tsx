import React, { useContext, useMemo } from "react";

type CellContextValue = {
  isActive: boolean;
};

const CellContext = React.createContext<CellContextValue | undefined>(
  undefined
);

type Props = {
  isActive: boolean;
  index: number;
  children: React.ReactNode;
};

export function CellProvider({ isActive, index, children }: Props) {
  const value = useMemo(
    () => ({
      isActive,
      index,
    }),
    [isActive, index]
  );
  return <CellContext.Provider value={value}>{children}</CellContext.Provider>;
}

export function useIsActive() {
  const value = useContext(CellContext);
  if (!value) {
    throw new Error("useIsActive must be called from within CellProvider!");
  }
  return value.isActive;
}
