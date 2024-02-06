function _extends() {
  _extends =
    Object.assign ||
    function (target) {
      for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i];
        for (var key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = source[key];
          }
        }
      }
      return target;
    };
  return _extends.apply(this, arguments);
}

import React from "react";
import { ScrollView } from "react-native-gesture-handler";
import Animated, { useAnimatedScrollHandler } from "react-native-reanimated";
import {
  NestableScrollContainerProvider,
  useSafeNestableScrollContainerContext,
} from "../context/nestableScrollContainerContext";
import { useStableCallback } from "../hooks/useStableCallback";
import useKeyboardListener from "../hooks/useKeyboardListener";
const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

function NestableScrollContainerInner(props) {
  const {
    outerScrollOffset,
    containerSize,
    scrollViewSize,
    scrollableRef,
    outerScrollEnabled,
  } = useSafeNestableScrollContainerContext();
  useKeyboardListener();
  const onScroll = useAnimatedScrollHandler({
    onScroll: (_ref) => {
      let { contentOffset } = _ref;
      outerScrollOffset.value = contentOffset.y;
    },
  });
  const onLayout = useStableCallback((event) => {
    const {
      nativeEvent: { layout },
    } = event;
    containerSize.value = layout.height;
  });
  const onContentSizeChange = useStableCallback((w, h) => {
    var _props$onContentSizeC;

    scrollViewSize.value = h;
    (_props$onContentSizeC = props.onContentSizeChange) === null ||
    _props$onContentSizeC === void 0
      ? void 0
      : _props$onContentSizeC.call(props, w, h);
  });
  return /*#__PURE__*/ React.createElement(
    AnimatedScrollView,
    _extends({}, props, {
      onLayout: onLayout,
      onContentSizeChange: onContentSizeChange,
      scrollEnabled: outerScrollEnabled,
      ref: scrollableRef,
      scrollEventThrottle: 1,
      onScroll: onScroll,
    })
  );
}

export const NestableScrollContainer = /*#__PURE__*/ React.forwardRef(
  (props, forwardedRef) => {
    return /*#__PURE__*/ React.createElement(
      NestableScrollContainerProvider,
      {
        forwardedRef: forwardedRef || undefined,
      },
      /*#__PURE__*/ React.createElement(NestableScrollContainerInner, props)
    );
  }
);
//# sourceMappingURL=NestableScrollContainer.js.map
