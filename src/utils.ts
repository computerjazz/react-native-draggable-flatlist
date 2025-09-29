import React from "react";
import { findNodeHandle as reactNativeFindNodeHandle } from 'react-native';

// Fixes bug with useMemo + generic types:
// https://github.com/DefinitelyTyped/DefinitelyTyped/issues/37087#issuecomment-542793243
export const typedMemo: <T>(c: T) => T = React.memo;

/**
 * React 19 compatible version of findNodeHandle.
 * In React 19, findNodeHandle is deprecated and refs should be used directly.
 * This utility provides backwards compatibility with React 18 while preparing for React 19.
 */
export function findNodeHandle(ref: any): number | null {
  // In React 19+, we can use the ref directly as it contains the native tag
  if (ref && typeof ref === 'object' && '_nativeTag' in ref) {
    return ref._nativeTag;
  }

  // For React 18 and below, use the traditional findNodeHandle
  if (reactNativeFindNodeHandle) {
    return reactNativeFindNodeHandle(ref);
  }

  // Fallback: try to extract native tag from ref
  if (ref && typeof ref === 'object') {
    // Check for common native tag properties
    if ('_nativeTag' in ref) return ref._nativeTag;
    if ('nativeTag' in ref) return ref.nativeTag;
    if ('tag' in ref) return ref.tag;
  }

  return null;
}
