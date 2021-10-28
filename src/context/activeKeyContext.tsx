import React, { useContext, useMemo } from "react"

export type ActiveKeyContextValue = {
  activeKey: string | null;
  isActiveVisible: boolean;
};

const ActiveKeyContext = React.createContext<ActiveKeyContextValue | undefined>(
  undefined
);

export const ActiveKeyProvider = ({ activeKey, isActiveVisible, children }: ActiveKeyContextValue & { children: React.ReactNode }) => {
  const activeKeyValue = useMemo(
    () => ({
      activeKey,
      isActiveVisible,
    }),
    [activeKey, isActiveVisible]
  );

    return (
      <ActiveKeyContext.Provider value={activeKeyValue}>
        {children}
      </ActiveKeyContext.Provider>
    )
}

export function useActiveKey() {
  const value = useContext(ActiveKeyContext);
  if (!value) {
    throw new Error(
      "useActiveKey must be called within ActiveKeyContext.Provider"
    );
  }
  return value;
}