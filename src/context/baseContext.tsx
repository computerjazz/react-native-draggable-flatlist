import React from "react";
import { ActiveKeyContextValue, ActiveKeyProvider } from "./activeKeyContext";
import { PropsProvider } from "./propsContext";
import { DraggableFlatListProps, typedMemo } from "../types";
import { StaticContextValue, StaticValueProvider } from "./staticValueContext";

type Props<T> = StaticContextValue<T> &
  ActiveKeyContextValue & {
    props: DraggableFlatListProps<T>;
    children: React.ReactNode;
  };

function DraggableFlatListProviderBase<T>({
  children,
  activeKey,
  isActiveVisible,
  props,
  ...rest
}: Props<T>) {
  const staticValue = {
    ...rest,
  };

  return (
    <ActiveKeyProvider activeKey={activeKey} isActiveVisible={isActiveVisible}>
      <StaticValueProvider {...staticValue}>
        <PropsProvider horizontal={!!props.horizontal}>
          {children}
        </PropsProvider>
      </StaticValueProvider>
    </ActiveKeyProvider>
  );
}

export const DraggableFlatListProvider = typedMemo(
  DraggableFlatListProviderBase
);
