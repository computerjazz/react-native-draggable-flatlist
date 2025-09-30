import React from "react";
import { findNodeHandle as reactNativeFindNodeHandle, Platform } from 'react-native';

// Fixes bug with useMemo + generic types:
// https://github.com/DefinitelyTyped/DefinitelyTyped/issues/37087#issuecomment-542793243
export const typedMemo: <T>(c: T) => T = React.memo;


export function findNodeHandle(ref: any): number | null {
  if(Platform.OS === "web") {
    return ref && typeof ref === 'object' && 'current' in ref ? ref.current : ref
  }
  return reactNativeFindNodeHandle(ref)
}
