import React, { useContext, useMemo } from "react";

type DraggableFlatlistContextValue<T> = {
  activeKey: string | null;
  keyExtractor: (item: T, index: number) => void;
  onDragEnd: ([from, to]: readonly number[]) => void;
};

const DraggableFlatListContext = React.createContext<
  DraggableFlatlistContextValue<any> | undefined
>(undefined);

type Props<T> = {
  activeKey: string | null;
  onDragEnd: ([from, to]: readonly number[]) => void;
  keyExtractor: (item: T, index: number) => string;
  children: React.ReactNode;
};

export default function DraggableFlatListProvider<T>({
  activeKey,
  onDragEnd,
  keyExtractor,
  children,
}: Props<T>) {
  const value = useMemo(
    () => ({
      activeKey,
      keyExtractor,
      onDragEnd,
    }),
    [activeKey, onDragEnd, keyExtractor]
  );

  return (
    <DraggableFlatListContext.Provider value={value}>
      {children}
    </DraggableFlatListContext.Provider>
  );
}

export function useDraggableFlatListContext<T>() {
  const value = useContext(DraggableFlatListContext);
  if (!value) {
    throw new Error(
      "useDraggableFlatListContext must be called within DraggableFlatListProvider"
    );
  }
  return value as DraggableFlatlistContextValue<T>;
}
