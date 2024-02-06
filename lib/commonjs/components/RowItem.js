var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = void 0;
var _objectWithoutProperties2 = _interopRequireDefault(
  require("@babel/runtime/helpers/objectWithoutProperties")
);
var _react = _interopRequireWildcard(require("react"));
var _draggableFlatListContext = require("../context/draggableFlatListContext");
var _refContext = require("../context/refContext");
var _useStableCallback = require("../hooks/useStableCallback");
var _utils = require("../utils");
var _reactNativeGestureHandler = require("react-native-gesture-handler");
var _reactNativeReanimated = require("react-native-reanimated");
var _jsxFileName =
  "/Users/cs/Code/react-native-draggable-flatlist/src/components/RowItem.tsx";
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
function RowItem(props) {
  var propsRef = (0, _react.useRef)(props);
  propsRef.current = props;
  var _useDraggableFlatList = (0,
    _draggableFlatListContext.useDraggableFlatListContext)(),
    activeKey = _useDraggableFlatList.activeKey;
  var activeKeyRef = (0, _react.useRef)(activeKey);
  activeKeyRef.current = activeKey;
  var _useRefs = (0, _refContext.useRefs)(),
    keyToIndexRef = _useRefs.keyToIndexRef;
  var drag = (0, _useStableCallback.useStableCallback)(function () {
    var _propsRef$current = propsRef.current,
      drag = _propsRef$current.drag,
      itemKey = _propsRef$current.itemKey,
      debug = _propsRef$current.debug;
    if (activeKeyRef.current) {
      if (debug)
        console.log(
          "## attempt to drag item while another item is already active, noop"
        );
    }
    drag(itemKey);
  });
  var renderItem = props.renderItem,
    item = props.item,
    itemKey = props.itemKey,
    panGesture = props.panGesture,
    enabled = props.enabled,
    extraData = props.extraData;
  var tapGesture = _reactNativeGestureHandler.Gesture.Tap()
    .onTouchesDown(
      (function () {
        var _f = function _f() {
          enabled.value = true;
          (0, _reactNativeReanimated.runOnJS)(drag)();
        };
        _f._closure = {
          enabled: enabled,
          runOnJS: _reactNativeReanimated.runOnJS,
          drag: drag,
        };
        _f.asString =
          "function _f(){const{enabled,runOnJS,drag}=jsThis._closure;{enabled.value=true;runOnJS(drag)();}}";
        _f.__workletHash = 8335102146761;
        _f.__location =
          "/Users/cs/Code/react-native-draggable-flatlist/src/components/RowItem.tsx (45:19)";
        return _f;
      })()
    )
    .onTouchesUp(
      (function () {
        var _f = function _f() {
          enabled.value = false;
        };
        _f._closure = { enabled: enabled };
        _f.asString =
          "function _f(){const{enabled}=jsThis._closure;{enabled.value=false;}}";
        _f.__workletHash = 9465620530585;
        _f.__location =
          "/Users/cs/Code/react-native-draggable-flatlist/src/components/RowItem.tsx (49:17)";
        return _f;
      })()
    )
    .simultaneousWithExternalGesture(panGesture);
  var getIndex = (0, _useStableCallback.useStableCallback)(function () {
    return keyToIndexRef.current.get(itemKey);
  });
  return _react.default.createElement(MemoizedInner, {
    isActive: activeKey === itemKey,
    renderItem: renderItem,
    item: item,
    getIndex: getIndex,
    tapGesture: tapGesture,
    extraData: extraData,
    __self: this,
    __source: { fileName: _jsxFileName, lineNumber: 59, columnNumber: 5 },
  });
}
var _default = (0, _utils.typedMemo)(RowItem);
exports.default = _default;
function Inner(_ref) {
  var renderItem = _ref.renderItem,
    extraData = _ref.extraData,
    rest = (0, _objectWithoutProperties2.default)(_ref, [
      "renderItem",
      "extraData",
    ]);
  return renderItem(Object.assign({}, rest));
}
var MemoizedInner = (0, _utils.typedMemo)(Inner);
//# sourceMappingURL=RowItem.js.map
