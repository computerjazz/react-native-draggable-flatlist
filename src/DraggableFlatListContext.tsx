import React, { useContext, useMemo } from "react";
import Animated from "react-native-reanimated";
import { AnimatedFlatListType, DraggableFlatListProps } from "./types";

type DraggableFlatListContextValue<T> = {
  cellDataRef: React.MutableRefObject<Map<string, any>>;
  keyToIndexRef: React.MutableRefObject<Map<string, number>>;
  activeIndexAnim: Animated.SharedValue<number>;
  spacerIndexAnim: Animated.SharedValue<number>;
  hoverOffset: Animated.SharedValue<number>;
  activeCellSize: Animated.SharedValue<number>;
  activeCellOffset: Animated.SharedValue<number>;
  scrollOffset: Animated.SharedValue<number>;
  placeholderOffset: Animated.SharedValue<number>;
  activeKeyAnim: Animated.SharedValue<string>;
  horizontalAnim: Animated.SharedValue<boolean>;
  isHovering: Animated.SharedValue<boolean>;
  animationConfigRef: React.MutableRefObject<Animated.WithSpringConfig>;
  keyExtractor: (item: T, index: number) => string;
  flatlistRef: React.RefObject<AnimatedFlatListType>;
  activeKey: string | null;
  propsRef: DraggableFlatListProps<T>;
};

const DraggableFlatListContext = React.createContext<
  DraggableFlatListContextValue | undefined
>(undefined);

type Props<T> = DraggableFlatListContextValue<T> & {
  children: React.ReactNode;
};

export const DraggableFlatListProvider = React.memo(function <T>({
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
  flatlistRef,
  activeKey,
  keyExtractor,
  propsRef,
}: Props<T>) {
  const value = useMemo(() => {
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
      flatlistRef,
      activeKey,
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
    flatlistRef,
    activeKey,
    keyExtractor,
    propsRef,
  ]);

  return (
    <DraggableFlatListContext.Provider value={value}>
      {children}
    </DraggableFlatListContext.Provider>
  );
});

export const useDraggableFlatListContext = () => {
  const value = useContext(DraggableFlatListContext);
  if (!value) {
    throw new Error(
      "useDraggableFlatListContext must be called within DraggableFlatListContext.Provider"
    );
  }
  return value;
};
