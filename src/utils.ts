import React from "react";
import { isWeb } from "./constants";

// Fixes bug with useMemo + generic types:
// https://github.com/DefinitelyTyped/DefinitelyTyped/issues/37087#issuecomment-542793243
export const typedMemo: <T>(c: T) => T = React.memo;

// Reanimated only reads hook dependency arrays on web when its Babel plugin is not used.
// Native derives them from the worklet closure, and Reanimated 4.6+ warns on every render
// when an array is passed there.
export function webOnlyDeps<T extends unknown[]>(deps: T): T | undefined {
  return isWeb ? deps : undefined;
}
