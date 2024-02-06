Object.defineProperty(exports, "__esModule", { value: true });
exports.default = RefProvider;
exports.useRefs = useRefs;
var _react = _interopRequireWildcard(require("react"));
var _constants = require("../constants");
var _propsContext = require("./propsContext");
var _jsxFileName =
  "/Users/cs/Code/react-native-draggable-flatlist/src/context/refContext.tsx";
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
var RefContext = _react.default.createContext(undefined);
function RefProvider(_ref) {
  var children = _ref.children,
    flatListRef = _ref.flatListRef;
  var value = useSetupRefs({ flatListRef: flatListRef });
  return _react.default.createElement(
    RefContext.Provider,
    {
      value: value,
      __self: this,
      __source: { fileName: _jsxFileName, lineNumber: 30, columnNumber: 10 },
    },
    children
  );
}
function useRefs() {
  var value = (0, _react.useContext)(RefContext);
  if (!value) {
    throw new Error(
      "useRefs must be called from within a RefContext.Provider!"
    );
  }
  return value;
}
function useSetupRefs(_ref2) {
  var flatListRefProp = _ref2.flatListRef;
  var props = (0, _propsContext.useProps)();
  var _props$animationConfi = props.animationConfig,
    animationConfig =
      _props$animationConfi === void 0
        ? _constants.DEFAULT_PROPS.animationConfig
        : _props$animationConfi;
  var propsRef = (0, _react.useRef)(props);
  propsRef.current = props;
  var animConfig = Object.assign(
    {},
    _constants.DEFAULT_PROPS.animationConfig,
    animationConfig
  );
  var animationConfigRef = (0, _react.useRef)(animConfig);
  animationConfigRef.current = animConfig;
  var cellDataRef = (0, _react.useRef)(new Map());
  var keyToIndexRef = (0, _react.useRef)(new Map());
  var containerRef = (0, _react.useRef)(null);
  var flatlistRefInternal = (0, _react.useRef)(null);
  var flatlistRef = flatListRefProp || flatlistRefInternal;
  var scrollViewRef = (0, _react.useRef)(null);
  var refs = (0, _react.useMemo)(function () {
    return {
      animationConfigRef: animationConfigRef,
      cellDataRef: cellDataRef,
      containerRef: containerRef,
      flatlistRef: flatlistRef,
      keyToIndexRef: keyToIndexRef,
      propsRef: propsRef,
      scrollViewRef: scrollViewRef,
    };
  }, []);
  return refs;
}
//# sourceMappingURL=refContext.js.map
