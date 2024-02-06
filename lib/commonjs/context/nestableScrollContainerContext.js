var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", { value: true });
exports.NestableScrollContainerProvider = NestableScrollContainerProvider;
exports.useNestableScrollContainerContext = useNestableScrollContainerContext;
exports.useSafeNestableScrollContainerContext = useSafeNestableScrollContainerContext;
var _slicedToArray2 = _interopRequireDefault(
  require("@babel/runtime/helpers/slicedToArray")
);
var _react = _interopRequireWildcard(require("react"));
var _reactNativeReanimated = require("react-native-reanimated");
var _jsxFileName =
  "/Users/cs/Code/react-native-draggable-flatlist/src/context/nestableScrollContainerContext.tsx";
function _getRequireWildcardCache(nodeInterop) {
  if (typeof WeakMap !== "function") return null;
  var cacheBabelInterop = new WeakMap();
  var cacheNodeInterop = new WeakMap();
  return (_getRequireWildcardCache = function _getRequireWildcardCache(
    nodeInterop
  ) {
    return nodeInterop ? cacheNodeInterop : cacheBabelInterop;
  })(nodeInterop);
}
function _interopRequireWildcard(obj, nodeInterop) {
  if (!nodeInterop && obj && obj.__esModule) {
    return obj;
  }
  if (obj === null || (typeof obj !== "object" && typeof obj !== "function")) {
    return { default: obj };
  }
  var cache = _getRequireWildcardCache(nodeInterop);
  if (cache && cache.has(obj)) {
    return cache.get(obj);
  }
  var newObj = {};
  var hasPropertyDescriptor =
    Object.defineProperty && Object.getOwnPropertyDescriptor;
  for (var key in obj) {
    if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) {
      var desc = hasPropertyDescriptor
        ? Object.getOwnPropertyDescriptor(obj, key)
        : null;
      if (desc && (desc.get || desc.set)) {
        Object.defineProperty(newObj, key, desc);
      } else {
        newObj[key] = obj[key];
      }
    }
  }
  newObj.default = obj;
  if (cache) {
    cache.set(obj, newObj);
  }
  return newObj;
}
var NestableScrollContainerContext = _react.default.createContext(undefined);
function useSetupNestableScrollContextValue(_ref) {
  var forwardedRef = _ref.forwardedRef;
  var _useState = (0, _react.useState)(true),
    _useState2 = (0, _slicedToArray2.default)(_useState, 2),
    outerScrollEnabled = _useState2[0],
    setOuterScrollEnabled = _useState2[1];
  var scrollViewSize = (0, _reactNativeReanimated.useSharedValue)(0);
  var scrollableRefInner = (0, _react.useRef)(null);
  var scrollableRef = forwardedRef || scrollableRefInner;
  var outerScrollOffset = (0, _reactNativeReanimated.useSharedValue)(0);
  var containerSize = (0, _reactNativeReanimated.useSharedValue)(0);
  var contextVal = (0, _react.useMemo)(
    function () {
      return {
        outerScrollEnabled: outerScrollEnabled,
        setOuterScrollEnabled: setOuterScrollEnabled,
        outerScrollOffset: outerScrollOffset,
        scrollViewSize: scrollViewSize,
        scrollableRef: scrollableRef,
        containerSize: containerSize,
      };
    },
    [outerScrollEnabled]
  );
  return contextVal;
}
function NestableScrollContainerProvider(_ref2) {
  var children = _ref2.children,
    forwardedRef = _ref2.forwardedRef;
  var contextVal = useSetupNestableScrollContextValue({
    forwardedRef: forwardedRef,
  });
  return _react.default.createElement(
    NestableScrollContainerContext.Provider,
    {
      value: contextVal,
      __self: this,
      __source: { fileName: _jsxFileName, lineNumber: 48, columnNumber: 5 },
    },
    children
  );
}
function useNestableScrollContainerContext() {
  var value = (0, _react.useContext)(NestableScrollContainerContext);
  return value;
}
function useSafeNestableScrollContainerContext() {
  var value = useNestableScrollContainerContext();
  if (!value) {
    throw new Error(
      "useSafeNestableScrollContainerContext must be called within a NestableScrollContainerContext.Provider"
    );
  }
  return value;
}
//# sourceMappingURL=nestableScrollContainerContext.js.map
