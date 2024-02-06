import { RenderItem } from "../types";
import { PanGesture } from "react-native-gesture-handler";
import { SharedValue } from "react-native-reanimated";
declare type Props<T> = {
  extraData?: any;
  drag: (itemKey: string) => void;
  enabled: SharedValue<boolean>;
  item: T;
  renderItem: RenderItem<T>;
  itemKey: string;
  panGesture: PanGesture;
  debug?: boolean;
};
declare function RowItem<T>(props: Props<T>): JSX.Element;
declare const _default: typeof RowItem;
export default _default;
