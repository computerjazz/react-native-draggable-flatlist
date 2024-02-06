Object.defineProperty(exports, "__esModule", { value: true });
exports.default = useKeyboardListener;
var _react = require("react");
var _reactNative = require("react-native");
var _nestableScrollContainerContext = require("../context/nestableScrollContainerContext");
var shouldTrackKeyboard = _reactNative.Platform.OS === "ios";
function useKeyboardEvent(eventType, callback) {
  (0, _react.useEffect)(
    function () {
      if (!callback) {
        return;
      }
      var listener = _reactNative.Keyboard.addListener(eventType, callback);
      return function () {
        return listener.remove();
      };
    },
    [eventType, callback]
  );
}
function useKeyboardListener() {
  var _useSafeNestableScrol = (0,
    _nestableScrollContainerContext.useSafeNestableScrollContainerContext)(),
    outerScrollOffset = _useSafeNestableScrol.outerScrollOffset,
    scrollableRef = _useSafeNestableScrol.scrollableRef;
  var onKeyboardShown = (0, _react.useCallback)(function (e) {
    var keyboardHeight = e.endCoordinates.height;
    var currentInput = _reactNative.TextInput.State.currentlyFocusedInput();
    if (!currentInput) {
      return;
    }
    currentInput.measure(function (
      originX,
      originY,
      width,
      height,
      pageX,
      pageY
    ) {
      var yFromTop = pageY;
      var componentHeight = height;
      var screenHeight = _reactNative.Dimensions.get("window").height;
      var yFromBottom = screenHeight - yFromTop - componentHeight;
      var hiddenOffset = keyboardHeight - yFromBottom;
      var margin = 32;
      if (hiddenOffset > 0) {
        var _scrollableRef$curren;
        (_scrollableRef$curren = scrollableRef.current) == null
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
