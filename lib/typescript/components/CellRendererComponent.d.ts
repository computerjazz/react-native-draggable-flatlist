import React from "react";
import { LayoutChangeEvent, StyleProp, ViewStyle } from "react-native";
declare type Props<T> = {
  item: T;
  index: number;
  children: React.ReactNode;
  onLayout?: (e: LayoutChangeEvent) => void;
  style?: StyleProp<ViewStyle>;
};
declare function CellRendererComponent<T>(props: Props<T>): JSX.Element;
declare const _default: typeof CellRendererComponent;
export default _default;
declare global {
  namespace NodeJS {
    interface Global {
      RNDFLLayoutAnimationConfigStash: Record<string, unknown>;
    }
  }
}
