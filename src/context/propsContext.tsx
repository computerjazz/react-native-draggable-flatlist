import React, { useContext, useMemo } from "react"

type PropsContextValue = {
  horizontal?: boolean;
};

const PropsContext = React.createContext<PropsContextValue | undefined>(
  undefined
);

export function PropsProvider({ horizontal, children }: PropsContextValue & { children: React.ReactNode }) {
  const propsValue = useMemo(
    () => ({
      horizontal,
    }),
    [horizontal]
  );

  return (
    <PropsContext.Provider value={propsValue}>
      {children}
    </PropsContext.Provider>
  )

}

export function useProps() {
  const value = useContext(PropsContext);
  if (!value) {
    throw new Error("useProps must be called within PropsContext.Provider");
  }
  return value;
}
