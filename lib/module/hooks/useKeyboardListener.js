import { useCallback, useEffect } from "react";
import { Dimensions, Keyboard, Platform, TextInput } from "react-native";
import { useSafeNestableScrollContainerContext } from "../context/nestableScrollContainerContext";
const shouldTrackKeyboard = Platform.OS === "ios";

function useKeyboardEvent(eventType, callback) {
  useEffect(() => {
    if (!callback) {
      return;
    }

    const listener = Keyboard.addListener(eventType, callback);
    return () => listener.remove();
  }, [eventType, callback]);
}

export default function useKeyboardListener() {
  const {
    outerScrollOffset,
    scrollableRef,
  } = useSafeNestableScrollContainerContext();
  const onKeyboardShown = useCallback((e) => {
    const keyboardHeight = e.endCoordinates.height;
    const currentInput = TextInput.State.currentlyFocusedInput();

    if (!currentInput) {
      return;
    }

    currentInput.measure((originX, originY, width, height, pageX, pageY) => {
      const yFromTop = pageY;
      const componentHeight = height;
      const screenHeight = Dimensions.get("window").height;
      const yFromBottom = screenHeight - yFromTop - componentHeight;
      const hiddenOffset = keyboardHeight - yFromBottom;
      const margin = 32;

      if (hiddenOffset > 0) {
        var _scrollableRef$curren;

        (_scrollableRef$curren = scrollableRef.current) === null ||
        _scrollableRef$curren === void 0
          ? void 0
          : _scrollableRef$curren.scrollTo({
              animated: true,
              y: outerScrollOffset.value + hiddenOffset + margin,
            });
      }
    });
  }, []);
  useKeyboardEvent(
    "keyboardDidShow",
    shouldTrackKeyboard ? onKeyboardShown : null
  );
}
//# sourceMappingURL=useKeyboardListener.js.map
