Object.defineProperty(exports, "__esModule", { value: true });
exports.useStableCallback = useStableCallback;
var _react = require("react");
function useStableCallback(cb) {
  var cbRef = (0, _react.useRef)(cb);
  cbRef.current = cb;
  var identityRetainingCb = (0, _react.useCallback)(function () {
    return cbRef.current.apply(cbRef, arguments);
  }, []);
  return identityRetainingCb;
}
//# sourceMappingURL=useStableCallback.js.map
