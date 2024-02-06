import { WithSpringConfig } from "react-native-reanimated";
export declare const SCROLL_POSITION_TOLERANCE = 2;
export declare const DEFAULT_ANIMATION_CONFIG: WithSpringConfig;
export declare const DEFAULT_PROPS: {
  autoscrollThreshold: number;
  autoscrollSpeed: number;
  animationConfig: WithSpringConfig;
  scrollEnabled: boolean;
  dragHitSlop:
    | import("react-native-gesture-handler/lib/typescript/handlers/gestureHandlerCommon").HitSlop
    | undefined;
  activationDistance: number;
  dragItemOverflow: boolean;
};
export declare const isIOS: boolean;
export declare const isAndroid: boolean;
export declare const isWeb: boolean;
export declare const isReanimatedV2 = true;
