import React from "react";
import { DraggableFlatListProps } from "../types";
declare type Props<T> = DraggableFlatListProps<T> & {
  children: React.ReactNode;
};
export default function PropsProvider<T>({
  children,
  ...props
}: Props<T>): JSX.Element;
export declare function useProps<T>(): DraggableFlatListProps<T>;
export {};
