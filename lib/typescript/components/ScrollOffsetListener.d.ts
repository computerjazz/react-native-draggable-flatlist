import Animated from "react-native-reanimated";
declare type Props = {
  scrollOffset: Animated.SharedValue<number>;
  onScrollOffsetChange: (offset: number) => void;
};
declare const _default: ({ scrollOffset, onScrollOffsetChange }: Props) => null;
export default _default;
