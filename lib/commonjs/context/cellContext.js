Object.defineProperty(exports, "__esModule", { value: true });
exports.CellProvider = CellProvider;
exports.useIsActive = useIsActive;
exports.default = void 0;
var _react = _interopRequireWildcard(require("react"));
var _utils = require("../utils");
var _jsxFileName =
  "/Users/cs/Code/react-native-draggable-flatlist/src/context/cellContext.tsx";
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
var CellContext = _react.default.createContext(undefined);
function CellProvider(_ref) {
  var isActive = _ref.isActive,
    children = _ref.children;
  var value = (0, _react.useMemo)(
    function () {
      return { isActive: isActive };
    },
    [isActive]
  );
  return _react.default.createElement(
    CellContext.Provider,
    {
      value: value,
      __self: this,
      __source: { fileName: _jsxFileName, lineNumber: 24, columnNumber: 10 },
    },
    children
  );
}
var _default = (0, _utils.typedMemo)(CellProvider);
exports.default = _default;
function useIsActive() {
  var value = (0, _react.useContext)(CellContext);
  if (!value) {
    throw new Error("useIsActive must be called from within CellProvider!");
  }
  return value.isActive;
}
//# sourceMappingURL=cellContext.js.map
