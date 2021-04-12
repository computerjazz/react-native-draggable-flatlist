import React, { useCallback, useEffect, useRef } from "react";
import { useDraggableFlatListContext } from "./DraggableFlatListContext";
import { RowItemProps } from "./types";

function RowItem<T>(props: RowItemProps<T>) {
  const propsRef = useRef(props);
  propsRef.current = props;

  const { keyToIndexRef } = useDraggableFlatListContext();

  const drag = useCallback(() => {
    const { drag, renderItem, item, itemKey, debug } = propsRef.current;
    const hoverComponent = renderItem({
      isActive: true,
      item,
      index: keyToIndexRef.current.get(itemKey),
      drag: () => {
        if (debug) {
          console.log("## attempt to call drag() on hovering component");
        }
      }
    });
    drag(hoverComponent, itemKey);
  }, []);

  useEffect(() => {
    return () => {
      const { onUnmount } = propsRef.current;
      onUnmount?.();
    };
  }, []);

  const { renderItem, item, itemKey } = props;
  return renderItem({
    isActive: false,
    item,
    drag,
    index: keyToIndexRef.current.get(itemKey)
  }) as JSX.Element;
}

export default React.memo(RowItem);
