import { RenderPlaceholder } from "../types";
declare type Props<T> = {
  renderPlaceholder?: RenderPlaceholder<T>;
};
declare function PlaceholderItem<T>({
  renderPlaceholder,
}: Props<T>): JSX.Element;
declare const _default: typeof PlaceholderItem;
export default _default;
