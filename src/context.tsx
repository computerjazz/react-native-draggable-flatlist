import React, { useContext, useMemo, useRef } from "react";
import { FlatList } from "react-native-gesture-handler";
import Animated from "react-native-reanimated";
import { DraggableFlatListProps } from "./types";
import { useSpring } from "./useSpring";
import { typedMemo } from "./utils";

type StaticContextValue<T> = {
  activeCellOffset: Animated.Value<number>;
  activeCellSize: Animated.Value<number>;
  activeIndexAnim: Animated.Value<number>;
  animationConfigRef: React.MutableRefObject<Animated.SpringConfig>;
  cellDataRef: React.MutableRefObject<Map<string, any>>;
  flatlistRef: React.RefObject<FlatList<T>>;
  hasMoved: Animated.Value<number>;
  horizontalAnim: Animated.Value<boolean>;
  hoverComponentTranslate: Animated.Value<number>;
  hoverOffset: Animated.Value<number>;
  hoverTo: Animated.Value<number>;
  isHovering: Animated.Value<boolean>;
  keyExtractor: (item: T, index: number) => string;
  keyToIndexRef: React.MutableRefObject<Map<string, number>>;
  placeholderOffset: Animated.Value<number>;
  placeholderScreenOffset: Animated.Value<number>;
  scrollOffset: Animated.Value<number>;
  spacerIndexAnim: Animated.Value<number>;
  isPressedIn: Animated.Value<number>;
  hoverSpring: ReturnType<typeof useSpring>;
  onDragEnd: (params: readonly number[]) => void;
  resetTouchedCell: Animated.Node<number>;
};

type ActiveKeyContextValue = {
  activeKey: string | null;
  isActiveVisible: boolean;
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

type Props<T> = StaticContextValue<T> &
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
  hoverComponentTranslate,
  hoverOffset,
  isActiveVisible,
  isHovering,
  keyExtractor,
  keyToIndexRef,
  placeholderOffset,
  placeholderScreenOffset,
  props,
  scrollOffset,
  spacerIndexAnim,
  isPressedIn,
  onDragEnd,
  resetTouchedCell,
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
      hoverComponentTranslate,
      hoverOffset,
      isHovering,
      keyExtractor,
      keyToIndexRef,
      placeholderOffset,
      placeholderScreenOffset,
      propsRef,
      scrollOffset,
      spacerIndexAnim,
      isPressedIn,
      onDragEnd,
      resetTouchedCell,
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
    hoverComponentTranslate,
    hoverOffset,
    isHovering,
    keyExtractor,
    keyToIndexRef,
    placeholderOffset,
    placeholderScreenOffset,
    scrollOffset,
    spacerIndexAnim,
    isPressedIn,
    onDragEnd,
    resetTouchedCell,
  ]);

  const activeKeyValue = useMemo(
    () => ({
      activeKey,
      isActiveVisible,
    }),
    [activeKey, isActiveVisible]
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
