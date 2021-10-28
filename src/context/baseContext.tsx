import React, { useRef } from "react";
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
  activeIndexAnim,
  spacerIndexAnim,
  hoverOffset,
  horizontalAnim,
  keyToIndexRef,
  cellDataRef,
  activeCellSize,
  activeCellOffset,
  scrollOffset,
  isHovering,
  animationConfigRef,
  placeholderOffset,
  placeholderScreenOffset,
  hoverComponentTranslate,
  flatlistRef,
  activeKey,
  isActiveVisible,
  keyExtractor,
  propsRef,
  props,
}: Props<T>) {


  const staticValue =  {
      activeIndexAnim,
      spacerIndexAnim,
      hoverOffset,
      horizontalAnim,
      keyToIndexRef,
      cellDataRef,
      activeCellSize,
      activeCellOffset,
      scrollOffset,
      isHovering,
      animationConfigRef,
      placeholderOffset,
      placeholderScreenOffset,
      flatlistRef,
      keyExtractor,
      hoverComponentTranslate,
      propsRef,
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

