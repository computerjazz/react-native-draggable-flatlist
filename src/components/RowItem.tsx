import React, { useRef } from "react";
import { useDraggableFlatListContext } from "../context/draggableFlatListContext";
import { useRefs } from "../context/refContext";
import { useStableCallback } from "../hooks/useStableCallback";
import { RenderItem } from "../types";
import { typedMemo } from "../utils";
import { Gesture, PanGesture, TapGesture } from "react-native-gesture-handler";
import { SharedValue, runOnJS } from "react-native-reanimated";

type Props<T> = {
  extraData?: any;
  drag: (itemKey: string) => void;
  enabled: SharedValue<boolean>;
  item: T;
  renderItem: RenderItem<T>;
  itemKey: string;
  panGesture: PanGesture;
  debug?: boolean;
};

function RowItem<T>(props: Props<T>) {
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

  return (
    <MemoizedInner
      isActive={activeKey === itemKey}
      renderItem={renderItem}
      item={item}
      getIndex={getIndex}
      tapGesture={tapGesture}
      extraData={extraData}
    />
  );
}

export default typedMemo(RowItem);

type InnerProps<T> = {
  isActive: boolean;
  item: T;
  getIndex: () => number | undefined;
  renderItem: RenderItem<T>;
  tapGesture: TapGesture;
  extraData?: any;
};

function Inner<T>({ renderItem, extraData, ...rest }: InnerProps<T>) {
  return renderItem({ ...rest }) as JSX.Element;
}

const MemoizedInner = typedMemo(Inner);
