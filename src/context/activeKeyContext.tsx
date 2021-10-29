import React, { useContext, useMemo } from "react";

export type ActiveKeyContextValue = {
  activeKey: string | null;
};

const ActiveKeyContext = React.createContext<ActiveKeyContextValue | undefined>(
  undefined
);

export const ActiveKeyProvider = ({
  activeKey,
  children,
}: ActiveKeyContextValue & { children: React.ReactNode }) => {
  const activeKeyValue = useMemo(
    () => ({
      activeKey,
    }),
    [activeKey]
  );

  return (
    <ActiveKeyContext.Provider value={activeKeyValue}>
      {children}
    </ActiveKeyContext.Provider>
  );
};

export function useActiveKey() {
  const value = useContext(ActiveKeyContext);
  if (!value) {
    throw new Error(
      "useActiveKey must be called within ActiveKeyContext.Provider"
    );
  }
  return value;
}
