import React, { useMemo, useState } from "react";
import { StyleSheet } from "react-native";
import Animated, {
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
} from "react-native-reanimated";
import { useAnimatedValues } from "../context/animatedValueContext";
import { useDraggableFlatListContext } from "../context/draggableFlatListContext";
import { useRefs } from "../context/refContext";
import { typedMemo } from "../utils";

function PlaceholderItem(_ref) {
  var _propsRef$current;

  let { renderPlaceholder } = _ref;
  const [size, setSize] = useState(0);
  const {
    activeCellSize,
    placeholderOffset,
    spacerIndexAnim,
    horizontalAnim,
    scrollOffset,
  } = useAnimatedValues();
  const { keyToIndexRef, propsRef } = useRefs();
  const { activeKey, horizontal } = useDraggableFlatListContext(); // Size does not seem to be respected when it is an animated style

  useAnimatedReaction(
    () => {
      return activeCellSize.value;
    },
    (cur, prev) => {
      if (cur !== prev) {
        runOnJS(setSize)(cur);
      }
    }
  );
  const activeIndex = activeKey
    ? keyToIndexRef.current.get(activeKey)
    : undefined;
  const activeItem =
    activeIndex === undefined
      ? null
      : (_propsRef$current = propsRef.current) === null ||
        _propsRef$current === void 0
      ? void 0
      : _propsRef$current.data[activeIndex];
  const animStyle = useAnimatedStyle(() => {
    const offset = placeholderOffset.value - scrollOffset.value;
    return {
      opacity: size >= 0 ? 1 : 0,
      overflow: "hidden",
      transform: [
        horizontalAnim.value
          ? {
              translateX: offset,
            }
          : {
              translateY: offset,
            },
      ],
    };
  }, [spacerIndexAnim, placeholderOffset, horizontalAnim, scrollOffset, size]);
  const extraStyle = useMemo(() => {
    return horizontal
      ? {
          width: size,
        }
      : {
          height: size,
        };
  }, [horizontal, size]);
  return /*#__PURE__*/ React.createElement(
    Animated.View,
    {
      pointerEvents: activeKey ? "auto" : "none",
      style: [StyleSheet.absoluteFill, animStyle, extraStyle],
    },
    !activeItem || activeIndex === undefined
      ? null
      : renderPlaceholder === null || renderPlaceholder === void 0
      ? void 0
      : renderPlaceholder({
          item: activeItem,
          index: activeIndex,
        })
  );
}

export default typedMemo(PlaceholderItem);
//# sourceMappingURL=PlaceholderItem.js.map
