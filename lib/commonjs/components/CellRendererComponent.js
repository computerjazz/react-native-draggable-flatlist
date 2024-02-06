var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = void 0;
var _extends2 = _interopRequireDefault(
  require("@babel/runtime/helpers/extends")
);
var _objectWithoutProperties2 = _interopRequireDefault(
  require("@babel/runtime/helpers/objectWithoutProperties")
);
var _react = _interopRequireWildcard(require("react"));
var _reactNative = require("react-native");
var _reactNativeReanimated = _interopRequireWildcard(
  require("react-native-reanimated")
);
var _draggableFlatListContext = require("../context/draggableFlatListContext");
var _constants = require("../constants");
var _useCellTranslate = require("../hooks/useCellTranslate");
var _utils = require("../utils");
var _refContext = require("../context/refContext");
var _animatedValueContext = require("../context/animatedValueContext");
var _cellContext = _interopRequireDefault(require("../context/cellContext"));
var _useStableCallback = require("../hooks/useStableCallback");
var _jsxFileName =
  "/Users/cs/Code/react-native-draggable-flatlist/src/components/CellRendererComponent.tsx";
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
function CellRendererComponent(props) {
  var item = props.item,
    index = props.index,
    onLayout = props.onLayout,
    children = props.children,
    rest = (0, _objectWithoutProperties2.default)(props, [
      "item",
      "index",
      "onLayout",
      "children",
    ]);
  var viewRef = (0, _react.useRef)(null);
  var _useRefs = (0, _refContext.useRefs)(),
    cellDataRef = _useRefs.cellDataRef,
    propsRef = _useRefs.propsRef,
    containerRef = _useRefs.containerRef;
  var _useAnimatedValues = (0, _animatedValueContext.useAnimatedValues)(),
    horizontalAnim = _useAnimatedValues.horizontalAnim,
    scrollOffset = _useAnimatedValues.scrollOffset;
  var _useDraggableFlatList = (0,
    _draggableFlatListContext.useDraggableFlatListContext)(),
    activeKey = _useDraggableFlatList.activeKey,
    keyExtractor = _useDraggableFlatList.keyExtractor,
    horizontal = _useDraggableFlatList.horizontal,
    layoutAnimationDisabled = _useDraggableFlatList.layoutAnimationDisabled;
  var key = keyExtractor(item, index);
  var offset = (0, _reactNativeReanimated.useSharedValue)(-1);
  var size = (0, _reactNativeReanimated.useSharedValue)(-1);
  var heldTanslate = (0, _reactNativeReanimated.useSharedValue)(0);
  var translate = (0, _useCellTranslate.useCellTranslate)({
    cellOffset: offset,
    cellSize: size,
    cellIndex: index,
  });
  var isActive = activeKey === key;
  var animStyle = (0, _reactNativeReanimated.useAnimatedStyle)(
    (function () {
      var _f = function _f() {
        if (translate.value && !_constants.isWeb) {
          heldTanslate.value = translate.value;
        }
        var t = activeKey ? translate.value : heldTanslate.value;
        return {
          transform: [
            horizontalAnim.value ? { translateX: t } : { translateY: t },
          ],
        };
      };
      _f._closure = {
        translate: translate,
        isWeb: _constants.isWeb,
        heldTanslate: heldTanslate,
        activeKey: activeKey,
        horizontalAnim: horizontalAnim,
      };
      _f.asString =
        "function _f(){const{translate,isWeb,heldTanslate,activeKey,horizontalAnim}=jsThis._closure;{if(translate.value&&!isWeb){heldTanslate.value=translate.value;}const t=activeKey?translate.value:heldTanslate.value;return{transform:[horizontalAnim.value?{translateX:t}:{translateY:t}]};}}";
      _f.__workletHash = 2668800953096;
      _f.__location =
        "/Users/cs/Code/react-native-draggable-flatlist/src/components/CellRendererComponent.tsx (59:37)";
      _f.__optimalization = 1;
      return _f;
    })(),
    [translate, activeKey]
  );
  var updateCellMeasurements = (0, _useStableCallback.useStableCallback)(
    function () {
      var onSuccess = function onSuccess(x, y, w, h) {
        if (_constants.isWeb && horizontal) x += scrollOffset.value;
        var cellOffset = horizontal ? x : y;
        var cellSize = horizontal ? w : h;
        cellDataRef.current.set(key, {
          measurements: { size: cellSize, offset: cellOffset },
        });
        size.value = cellSize;
        offset.value = cellOffset;
      };
      var onFail = function onFail() {
        var _propsRef$current;
        if (
          (_propsRef$current = propsRef.current) != null &&
          _propsRef$current.debug
        ) {
          console.log("## on measure fail, index: " + index);
        }
      };
      var containerNode = containerRef.current;
      var viewNode = viewRef.current;
      var nodeHandle = containerNode;
      if (viewNode && nodeHandle) {
        viewNode.measureLayout(nodeHandle, onSuccess, onFail);
      }
    }
  );
  var onCellLayout = (0, _useStableCallback.useStableCallback)(function (e) {
    heldTanslate.value = 0;
    updateCellMeasurements();
    if (onLayout && e) onLayout(e);
  });
  (0, _react.useEffect)(
    function () {
      if (_constants.isWeb) {
        requestAnimationFrame(function () {
          onCellLayout();
        });
      }
    },
    [index, onCellLayout]
  );
  var baseStyle = (0, _react.useMemo)(
    function () {
      return {
        elevation: isActive ? 1 : 0,
        zIndex: isActive ? 999 : 0,
        flexDirection: horizontal ? "row" : "column",
      };
    },
    [isActive, horizontal]
  );
  var _propsRef$current2 = propsRef.current,
    itemEnteringAnimation = _propsRef$current2.itemEnteringAnimation,
    itemExitingAnimation = _propsRef$current2.itemExitingAnimation,
    itemLayoutAnimation = _propsRef$current2.itemLayoutAnimation;
  (0, _react.useEffect)(
    function () {
      if (!propsRef.current.enableLayoutAnimationExperimental) return;
      var tag = (0, _reactNative.findNodeHandle)(viewRef.current);
      (0, _reactNativeReanimated.runOnUI)(
        (function () {
          var _f = function _f(t, _layoutDisabled) {
            if (!t) return;
            var config = global.LayoutAnimationRepository.configs[t];
            if (config) stashConfig(t, config);
            var stashedConfig = getStashedConfig(t);
            if (_layoutDisabled) {
              global.LayoutAnimationRepository.removeConfig(t);
            } else if (stashedConfig) {
              global.LayoutAnimationRepository.registerConfig(t, stashedConfig);
            }
          };
          _f._closure = {
            stashConfig: stashConfig,
            getStashedConfig: getStashedConfig,
          };
          _f.asString =
            "function _f(t,_layoutDisabled){const{stashConfig,getStashedConfig}=jsThis._closure;{if(!t)return;const config=global.LayoutAnimationRepository.configs[t];if(config)stashConfig(t,config);const stashedConfig=getStashedConfig(t);if(_layoutDisabled){global.LayoutAnimationRepository.removeConfig(t);}else if(stashedConfig){global.LayoutAnimationRepository.registerConfig(t,stashedConfig);}}}";
          _f.__workletHash = 14167513442446;
          _f.__location =
            "/Users/cs/Code/react-native-draggable-flatlist/src/components/CellRendererComponent.tsx (140:12)";
          return _f;
        })()
      )(tag, layoutAnimationDisabled);
    },
    [layoutAnimationDisabled]
  );
  return _react.default.createElement(
    _reactNativeReanimated.default.View,
    (0, _extends2.default)({}, rest, {
      ref: viewRef,
      onLayout: onCellLayout,
      entering: itemEnteringAnimation,
      exiting: itemExitingAnimation,
      layout: propsRef.current.enableLayoutAnimationExperimental
        ? itemLayoutAnimation
        : undefined,
      style: [
        props.style,
        baseStyle,
        activeKey ? animStyle : styles.zeroTranslate,
      ],
      pointerEvents: activeKey ? "none" : "auto",
      __self: this,
      __source: { fileName: _jsxFileName, lineNumber: 155, columnNumber: 5 },
    }),
    _react.default.createElement(
      _cellContext.default,
      {
        isActive: isActive,
        __self: this,
        __source: { fileName: _jsxFileName, lineNumber: 173, columnNumber: 7 },
      },
      children
    )
  );
}
var _default = (0, _utils.typedMemo)(CellRendererComponent);
exports.default = _default;
var styles = _reactNative.StyleSheet.create({
  zeroTranslate: { transform: [{ translateX: 0 }, { translateY: 0 }] },
});
(0, _reactNativeReanimated.runOnUI)(
  (function () {
    var _f = function _f() {
      global.RNDFLLayoutAnimationConfigStash = {};
    };
    _f._closure = {};
    _f.asString = "function _f(){global.RNDFLLayoutAnimationConfigStash={};}";
    _f.__workletHash = 11308490141335;
    _f.__location =
      "/Users/cs/Code/react-native-draggable-flatlist/src/components/CellRendererComponent.tsx (194:8)";
    return _f;
  })()
)();
var stashConfig = (function () {
  var _f = function _f(tag, config) {
    if (!global.RNDFLLayoutAnimationConfigStash)
      global.RNDFLLayoutAnimationConfigStash = {};
    global.RNDFLLayoutAnimationConfigStash[tag] = config;
  };
  _f._closure = {};
  _f.asString =
    "function stashConfig(tag,config){if(!global.RNDFLLayoutAnimationConfigStash)global.RNDFLLayoutAnimationConfigStash={};global.RNDFLLayoutAnimationConfigStash[tag]=config;}";
  _f.__workletHash = 481659566906;
  _f.__location =
    "/Users/cs/Code/react-native-draggable-flatlist/src/components/CellRendererComponent.tsx (199:0)";
  return _f;
})();
var getStashedConfig = (function () {
  var _f = function _f(tag) {
    if (!global.RNDFLLayoutAnimationConfigStash) return null;
    return global.RNDFLLayoutAnimationConfigStash[tag];
  };
  _f._closure = {};
  _f.asString =
    "function getStashedConfig(tag){if(!global.RNDFLLayoutAnimationConfigStash)return null;return global.RNDFLLayoutAnimationConfigStash[tag];}";
  _f.__workletHash = 4781167627856;
  _f.__location =
    "/Users/cs/Code/react-native-draggable-flatlist/src/components/CellRendererComponent.tsx (206:0)";
  return _f;
})();
//# sourceMappingURL=CellRendererComponent.js.map
