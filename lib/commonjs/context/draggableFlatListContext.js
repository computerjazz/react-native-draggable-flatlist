Object.defineProperty(exports, "__esModule", { value: true });
exports.default = DraggableFlatListProvider;
exports.useDraggableFlatListContext = useDraggableFlatListContext;
var _react = _interopRequireWildcard(require("react"));
var _jsxFileName =
  "/Users/cs/Code/react-native-draggable-flatlist/src/context/draggableFlatListContext.tsx";
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
var DraggableFlatListContext = _react.default.createContext(undefined);
function DraggableFlatListProvider(_ref) {
  var activeKey = _ref.activeKey,
    keyExtractor = _ref.keyExtractor,
    horizontal = _ref.horizontal,
    layoutAnimationDisabled = _ref.layoutAnimationDisabled,
    children = _ref.children;
  var value = (0, _react.useMemo)(
    function () {
      return {
        activeKey: activeKey,
        keyExtractor: keyExtractor,
        horizontal: horizontal,
        layoutAnimationDisabled: layoutAnimationDisabled,
      };
    },
    [activeKey, keyExtractor, horizontal, layoutAnimationDisabled]
  );
  return _react.default.createElement(
    DraggableFlatListContext.Provider,
    {
      value: value,
      __self: this,
      __source: { fileName: _jsxFileName, lineNumber: 35, columnNumber: 5 },
    },
    children
  );
}
function useDraggableFlatListContext() {
  var value = (0, _react.useContext)(DraggableFlatListContext);
  if (!value) {
    throw new Error(
      "useDraggableFlatListContext must be called within DraggableFlatListProvider"
    );
  }
  return value;
}
//# sourceMappingURL=draggableFlatListContext.js.map
