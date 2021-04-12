import React, { useContext, useMemo } from "react";
import Animated from "react-native-reanimated";

type DraggableFlatListContextValue = {
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
};

const DraggableFlatListContext = React.createContext<
  DraggableFlatListContextValue | undefined
>(undefined);

type Props = DraggableFlatListContextValue & { children: React.ReactNode };

export const DraggableFlatListProvider = React.memo(
  ({
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
    placeholderOffset
  }: Props) => {
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
        placeholderOffset
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
      placeholderOffset
    ]);

    return (
      <DraggableFlatListContext.Provider value={value}>
        {children}
      </DraggableFlatListContext.Provider>
    );
  }
);

export const useDraggableFlatListContext = () => {
  const value = useContext(DraggableFlatListContext);
  if (!value) {
    throw new Error(
      "useDraggableFlatListContext must be called within DraggableFlatListContext.Provider"
    );
  }
  return value;
};
