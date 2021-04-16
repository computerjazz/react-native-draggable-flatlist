import React, { useContext, useMemo, useRef } from "react";
import Animated from "react-native-reanimated";
import { AnimatedFlatListType, DraggableFlatListProps } from "./types";

type StaticContextValue<T> = {
  cellDataRef: React.MutableRefObject<Map<string, any>>;
  keyToIndexRef: React.MutableRefObject<Map<string, number>>;
  activeIndexAnim: Animated.SharedValue<number>;
  spacerIndexAnim: Animated.SharedValue<number>;
  hoverOffset: Animated.SharedValue<number>;
  activeCellSize: Animated.SharedValue<number>;
  activeCellOffset: Animated.SharedValue<number>;
  scrollOffset: Animated.SharedValue<number>;
  placeholderOffset: Animated.SharedValue<number>;
  placeholderScreenOffset: Animated.SharedValue<number>;
  activeKeyAnim: Animated.SharedValue<string>;
  horizontalAnim: Animated.SharedValue<boolean>;
  isHovering: Animated.SharedValue<boolean>;
  animationConfigRef: React.MutableRefObject<Animated.WithSpringConfig>;
  keyExtractor: (item: T, index: number) => string;
  flatlistRef: React.RefObject<AnimatedFlatListType>;
  propsRef: React.RefObject<DraggableFlatListProps<T>>;
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
  activeKeyAnim,
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
  activeKey,
  keyExtractor,
  props,
}: Props<T>) {
  const propsRef = useRef(props);
  propsRef.current = props;

  const staticValue = useMemo(() => {
    return {
      activeIndexAnim,
      spacerIndexAnim,
      hoverOffset,
      activeKeyAnim,
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
      propsRef,
    };
  }, [
    activeIndexAnim,
    activeKeyAnim,
    horizontalAnim,
    spacerIndexAnim,
    hoverOffset,
    activeCellSize,
    activeCellOffset,
    scrollOffset,
    isHovering,
    animationConfigRef,
    placeholderOffset,
    placeholderScreenOffset,
    flatlistRef,
    keyExtractor,
    cellDataRef,
    keyToIndexRef,
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

export const DraggableFlatListProvider = React.memo(
  DraggableFlatListProviderBase
);

export function useStaticValues<T>() {
  const value = useContext(StaticContext) as StaticContextValue<T>;
  if (!value) {
    throw new Error(
      "useStaticValues must be called within StaticContext.Provider"
    );
  }
  value.propsRef.current;
  value.hoverOffset;
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
