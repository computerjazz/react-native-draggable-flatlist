/// <reference types="react-native-reanimated" />
import React from "react";
import { ScrollView } from "react-native-gesture-handler";
export declare function NestableScrollContainerProvider({
  children,
  forwardedRef,
}: {
  children: React.ReactNode;
  forwardedRef?: React.MutableRefObject<ScrollView>;
}): JSX.Element;
export declare function useNestableScrollContainerContext():
  | {
      outerScrollEnabled: boolean;
      setOuterScrollEnabled: React.Dispatch<React.SetStateAction<boolean>>;
      outerScrollOffset: import("react-native-reanimated").SharedValue<number>;
      scrollViewSize: import("react-native-reanimated").SharedValue<number>;
      scrollableRef: React.RefObject<ScrollView>;
      containerSize: import("react-native-reanimated").SharedValue<number>;
    }
  | undefined;
export declare function useSafeNestableScrollContainerContext(): {
  outerScrollEnabled: boolean;
  setOuterScrollEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  outerScrollOffset: import("react-native-reanimated").SharedValue<number>;
  scrollViewSize: import("react-native-reanimated").SharedValue<number>;
  scrollableRef: React.RefObject<ScrollView>;
  containerSize: import("react-native-reanimated").SharedValue<number>;
};
