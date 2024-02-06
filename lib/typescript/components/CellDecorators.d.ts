import React from "react";
export { useOnCellActiveAnimation } from "../hooks/useOnCellActiveAnimation";
declare type ScaleProps = {
  activeScale?: number;
  children: React.ReactNode;
};
export declare const ScaleDecorator: ({
  activeScale,
  children,
}: ScaleProps) => JSX.Element;
declare type ShadowProps = {
  children: React.ReactNode;
  elevation?: number;
  radius?: number;
  color?: string;
  opacity?: number;
};
export declare const ShadowDecorator: ({
  elevation,
  color,
  opacity,
  radius,
  children,
}: ShadowProps) => JSX.Element;
declare type OpacityProps = {
  activeOpacity?: number;
  children: React.ReactNode;
};
export declare const OpacityDecorator: ({
  activeOpacity,
  children,
}: OpacityProps) => JSX.Element;
