import React from "react";
import { FlatListProps, StyleProp, ViewStyle } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import Animated from "react-native-reanimated";
import { DEFAULT_PROPS } from "./constants";

export type DragEndParams<T> = {
  data: T[];
  from: number;
  to: number;
};
type Modify<T, R> = Omit<T, keyof R> & R;

type DefaultProps = Readonly<typeof DEFAULT_PROPS>;

export type DraggableFlatListProps<T> = Modify<
  FlatListProps<T>,
  {
    autoscrollSpeed?: number;
    autoscrollThreshold?: number;
    data: T[];
    onRef?: (ref: React.RefObject<AnimatedFlatListType>) => void;
    onDragBegin?: (index: number) => void;
    onRelease?: (index: number) => void;
    onDragEnd?: (params: DragEndParams<T>) => void;
    renderItem: RenderItem<T>;
    renderPlaceholder?: RenderPlaceholder<T>;
    animationConfig: Partial<Animated.WithSpringConfig>;
    activationDistance?: number;
    debug?: boolean;
    layoutInvalidationKey?: string;
    onScrollOffsetChange?: (scrollOffset: number) => void;
    onPlaceholderIndexChange?: (placeholderIndex: number) => void;
    containerStyle?: StyleProp<ViewStyle>;
    dragItemOverflow?: boolean;
    simultaneousHandlers?: React.Ref<any> | React.Ref<any>[];
  } & Partial<DefaultProps>
>;

export type RenderPlaceholder<T> = (params: {
  item: T;
  index: number;
}) => JSX.Element;

export type RenderItemParams<T> = {
  item: T;
  index?: number; // This is technically a "last known index" since cells don't necessarily rerender when their index changes
  drag: () => void;
  isActive: boolean;
};

export type RenderItem<T> = (params: RenderItemParams<T>) => React.ReactNode;

export type RowItemProps<T> = {
  extraData?: any;
  drag: (hoverComponent: React.ReactNode, itemKey: string) => void;
  item: T;
  renderItem: RenderItem<T>;
  itemKey: string;
  debug?: boolean;
};

export type AnimatedFlatListType = <T>(
  props: Animated.AnimateProps<
    FlatListProps<T> & {
      ref: React.Ref<FlatList<T>>;
      simultaneousHandlers?: React.Ref<any> | React.Ref<any>[];
    }
  >
) => React.ReactElement;
