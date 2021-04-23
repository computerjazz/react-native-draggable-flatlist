import React, { useContext, useMemo, useRef } from "react";
import { FlatList } from "react-native-gesture-handler";
import Animated from "react-native-reanimated";
import { DraggableFlatListProps } from "./types";
import { typedMemo } from "./utils";

type StaticContextValue<T> = {
  activeCellOffset: Animated.Value<number>;
  activeCellSize: Animated.Value<number>;
  activeIndexAnim: Animated.Value<number>;
  animationConfigRef: React.MutableRefObject<Animated.SpringConfig>;
  cellDataRef: React.MutableRefObject<Map<string, any>>;
  flatlistRef: React.RefObject<FlatList<T>>;
  hasMoved: Animated.Value<number>;
  horizontalAnim: Animated.Node<0 | 1>;
  hoverOffset: Animated.Node<number>;
  isHovering: Animated.Node<0 | 1>;
  isDraggingCell: Animated.Node<number>;
  keyExtractor: (item: T, index: number) => string;
  keyToIndexRef: React.MutableRefObject<Map<string, number>>;
  onDragEnd: (params: readonly number[]) => void;
  placeholderOffset: Animated.Value<number>;
  placeholderScreenOffset: Animated.Node<number>;
  propsRef: React.MutableRefObject<DraggableFlatListProps<T>>;
  resetTouchedCell: Animated.Node<number>;
  scrollOffset: Animated.Value<number>;
  spacerIndexAnim: Animated.Value<number>;
};

type ActiveKeyContextValue = {
  activeKey: string | null;
};

type PropsContextValue = {
  horizontal?: boolean;
};

// context to hold values that remain referentially equal
const StaticContext = React.createContext<StaticContextValue<any> | undefined>(
  undefined
);
const ActiveKeyContext = React.createContext<ActiveKeyContextValue | undefined>(
  undefined
);
const PropsContext = React.createContext<PropsContextValue | undefined>(
  undefined
);

type Props<T> = Omit<StaticContextValue<T>, "propsRef"> &
  ActiveKeyContextValue & {
    props: DraggableFlatListProps<T>;
    children: React.ReactNode;
  };

function DraggableFlatListProviderBase<T>({
  activeCellOffset,
  activeCellSize,
  activeIndexAnim,
  activeKey,
  animationConfigRef,
  cellDataRef,
  children,
  flatlistRef,
  hasMoved,
  horizontalAnim,
  hoverOffset,
  isHovering,
  isDraggingCell,
  keyExtractor,
  keyToIndexRef,
  onDragEnd,
  placeholderOffset,
  placeholderScreenOffset,
  props,
  resetTouchedCell,
  scrollOffset,
  spacerIndexAnim,
}: Props<T>) {
  const propsRef = useRef(props);
  propsRef.current = props;

  const staticValue = useMemo(() => {
    return {
      activeCellOffset,
      activeCellSize,
      activeIndexAnim,
      animationConfigRef,
      cellDataRef,
      flatlistRef,
      hasMoved,
      horizontalAnim,
      hoverOffset,
      isHovering,
      isDraggingCell,
      keyExtractor,
      keyToIndexRef,
      onDragEnd,
      placeholderOffset,
      placeholderScreenOffset,
      propsRef,
      resetTouchedCell,
      scrollOffset,
      spacerIndexAnim,
    };
  }, [
    activeCellOffset,
    activeCellSize,
    activeIndexAnim,
    animationConfigRef,
    cellDataRef,
    flatlistRef,
    hasMoved,
    horizontalAnim,
    hoverOffset,
    isHovering,
    isDraggingCell,
    keyExtractor,
    keyToIndexRef,
    onDragEnd,
    placeholderOffset,
    placeholderScreenOffset,
    resetTouchedCell,
    scrollOffset,
    spacerIndexAnim,
  ]);

  const activeKeyValue = useMemo(
    () => ({
      activeKey,
    }),
    [activeKey]
  );

  const propsValue = useMemo(
    () => ({
      horizontal: !!props.horizontal,
    }),
    [props.horizontal]
  );

  return (
    <ActiveKeyContext.Provider value={activeKeyValue}>
      <StaticContext.Provider value={staticValue}>
        <PropsContext.Provider value={propsValue}>
          {children}
        </PropsContext.Provider>
      </StaticContext.Provider>
    </ActiveKeyContext.Provider>
  );
}

export const DraggableFlatListProvider = typedMemo(
  DraggableFlatListProviderBase
);

export function useStaticValues<T>() {
  const value = useContext(StaticContext) as StaticContextValue<T>;
  if (!value) {
    throw new Error(
      "useStaticValues must be called within StaticContext.Provider"
    );
  }
  return value;
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

export function useProps() {
  const value = useContext(PropsContext);
  if (!value) {
    throw new Error("useProps must be called within PropsContext.Provider");
  }
  return value;
}
