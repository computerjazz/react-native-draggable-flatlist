import React, { useRef } from "react";
import { useDraggableFlatListContext } from "../context/draggableFlatListContext";
import { useRefs } from "../context/refContext";
import { useStableCallback } from "../hooks/useStableCallback";
import { typedMemo } from "../utils";
import { Gesture } from "react-native-gesture-handler";
import { runOnJS } from "react-native-reanimated";

function RowItem(props) {
  const propsRef = useRef(props);
  propsRef.current = props;
  const { activeKey } = useDraggableFlatListContext();
  const activeKeyRef = useRef(activeKey);
  activeKeyRef.current = activeKey;
  const { keyToIndexRef } = useRefs();
  const drag = useStableCallback(() => {
    const { drag, itemKey, debug } = propsRef.current;

    if (activeKeyRef.current) {
      // already dragging an item, noop
      if (debug)
        console.log(
          "## attempt to drag item while another item is already active, noop"
        );
    }

    drag(itemKey);
  });
  const { renderItem, item, itemKey, panGesture, enabled, extraData } = props;
  const tapGesture = Gesture.Tap()
    .onTouchesDown(() => {
      enabled.value = true;
      runOnJS(drag)();
    })
    .onTouchesUp(() => {
      enabled.value = false;
    })
    .simultaneousWithExternalGesture(panGesture);
  const getIndex = useStableCallback(() => {
    return keyToIndexRef.current.get(itemKey);
  });
  return /*#__PURE__*/ React.createElement(MemoizedInner, {
    isActive: activeKey === itemKey,
    renderItem: renderItem,
    item: item,
    getIndex: getIndex,
    tapGesture: tapGesture,
    extraData: extraData,
  });
}

export default typedMemo(RowItem);

function Inner(_ref) {
  let { renderItem, extraData, ...rest } = _ref;
  return renderItem({ ...rest });
}

const MemoizedInner = typedMemo(Inner);
//# sourceMappingURL=RowItem.js.map
