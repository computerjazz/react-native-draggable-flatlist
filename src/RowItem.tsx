import React, { useCallback, useRef } from "react";
import { useStaticValues } from "./DraggableFlatListContext";
import { RenderItem } from "./types";

type Props<T> = {
  extraData?: any;
  drag: (hoverComponent: React.ReactNode, itemKey: string) => void;
  item: T;
  renderItem: RenderItem<T>;
  itemKey: string;
  debug?: boolean;
};

function RowItem<T>(props: Props<T>) {
  const propsRef = useRef(props);
  propsRef.current = props;

  const { keyToIndexRef } = useStaticValues();

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
      },
    });
    drag(hoverComponent, itemKey);
  }, [keyToIndexRef]);

  const { renderItem, item, itemKey } = props;
  return renderItem({
    isActive: false,
    item,
    drag,
    index: keyToIndexRef.current.get(itemKey),
  }) as JSX.Element;
}

export default React.memo(RowItem);
