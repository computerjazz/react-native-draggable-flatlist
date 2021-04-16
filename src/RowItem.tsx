import React, { useCallback, useRef } from "react";
import { useActiveKey, useStaticValues } from "./DraggableFlatListContext";
import { RenderItem } from "./types";

type Props<T> = {
  extraData?: any;
  drag: (itemKey: string) => void;
  item: T;
  renderItem: RenderItem<T>;
  itemKey: string;
  debug?: boolean;
};

function RowItem<T>(props: Props<T>) {
  const propsRef = useRef(props);
  propsRef.current = props;

  const { activeKey } = useActiveKey();
  const activeKeyRef = useRef(activeKey);
  activeKeyRef.current = activeKey;
  const { keyToIndexRef } = useStaticValues();

  const drag = useCallback(() => {
    const { drag, itemKey, debug } = propsRef.current;
    if (activeKeyRef.current) {
      // already dragging an item, noop
      if (debug)
        console.log(
          "## attempt to drag item while another item is already active, noop"
        );
    }
    drag(itemKey);
  }, []);

  const { renderItem, item, itemKey } = props;
  return (
    <MemoizedInner
      isActive={activeKey === itemKey}
      drag={drag}
      renderItem={renderItem}
      item={item}
      index={keyToIndexRef.current.get(itemKey)}
    />
  );
}

export default React.memo(RowItem);

type InnerProps<T> = {
  isActive: boolean;
  item: T;
  index: number;
  drag: () => void;
  renderItem: RenderItem<T>;
};

function Inner<T>({ isActive, item, drag, index, renderItem }: InnerProps<T>) {
  return renderItem({ isActive, item, drag, index }) as JSX.Element;
}

const MemoizedInner = React.memo(Inner);
