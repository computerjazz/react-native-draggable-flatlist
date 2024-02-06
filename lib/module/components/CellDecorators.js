import React from "react";
import { StyleSheet } from "react-native";
import Animated, {
  interpolate,
  useAnimatedStyle,
} from "react-native-reanimated";
import { useDraggableFlatListContext } from "../context/draggableFlatListContext";
export { useOnCellActiveAnimation } from "../hooks/useOnCellActiveAnimation";
import { useOnCellActiveAnimation } from "../hooks/useOnCellActiveAnimation";
export const ScaleDecorator = (_ref) => {
  let { activeScale = 1.1, children } = _ref;
  const { isActive, onActiveAnim } = useOnCellActiveAnimation({
    animationConfig: {
      mass: 0.1,
      restDisplacementThreshold: 0.0001,
    },
  });
  const { horizontal } = useDraggableFlatListContext();
  const style = useAnimatedStyle(() => {
    const animScale = interpolate(onActiveAnim.value, [0, 1], [1, activeScale]);
    const scale = isActive ? animScale : 1;
    return {
      transform: [
        {
          scaleX: scale,
        },
        {
          scaleY: scale,
        },
      ],
    };
  }, [isActive]);
  return /*#__PURE__*/ React.createElement(
    Animated.View,
    {
      style: [style, horizontal && styles.horizontal],
    },
    children
  );
};
export const ShadowDecorator = (_ref2) => {
  let {
    elevation = 10,
    color = "black",
    opacity = 0.25,
    radius = 5,
    children,
  } = _ref2;
  const { isActive, onActiveAnim } = useOnCellActiveAnimation();
  const { horizontal } = useDraggableFlatListContext();
  const style = useAnimatedStyle(() => {
    const shadowOpacity = onActiveAnim.value * opacity;
    return {
      elevation: isActive ? elevation : 0,
      shadowRadius: isActive ? radius : 0,
      shadowColor: isActive ? color : "transparent",
      shadowOpacity: isActive ? shadowOpacity : 0,
    };
  }, [isActive, onActiveAnim]);
  return /*#__PURE__*/ React.createElement(
    Animated.View,
    {
      style: [style, horizontal && styles.horizontal],
    },
    children
  );
};
export const OpacityDecorator = (_ref3) => {
  let { activeOpacity = 0.25, children } = _ref3;
  const { isActive, onActiveAnim } = useOnCellActiveAnimation();
  const { horizontal } = useDraggableFlatListContext();
  const style = useAnimatedStyle(() => {
    const opacity = interpolate(onActiveAnim.value, [0, 1], [1, activeOpacity]);
    return {
      opacity: isActive ? opacity : 1,
    };
  }, [isActive]);
  return /*#__PURE__*/ React.createElement(
    Animated.View,
    {
      style: [style, horizontal && styles.horizontal],
    },
    children
  );
};
const styles = StyleSheet.create({
  horizontal: {
    flexDirection: "row",
    flex: 1,
  },
});
//# sourceMappingURL=CellDecorators.js.map
