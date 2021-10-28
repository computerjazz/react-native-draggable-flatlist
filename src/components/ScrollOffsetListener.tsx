import React from "react";
import Animated, { runOnJS, useDerivedValue } from "react-native-reanimated";

type Props = {
  scrollOffset: Animated.SharedValue<number>;
  onScrollOffsetChange: (offset: number) => void;
};

const ScrollOffsetListener = ({
  scrollOffset,
  onScrollOffsetChange,
}: Props) => {
  useDerivedValue(() => {
    runOnJS(onScrollOffsetChange)(scrollOffset.value);
  });
  return null;
};

export default React.memo(ScrollOffsetListener);
