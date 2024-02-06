import React, { useContext } from "react";
import { useMemo, useRef } from "react";
import { DEFAULT_PROPS } from "../constants";
import { useProps } from "./propsContext";
const RefContext = /*#__PURE__*/ React.createContext(undefined);
export default function RefProvider(_ref) {
  let { children, flatListRef } = _ref;
  const value = useSetupRefs({
    flatListRef,
  });
  return /*#__PURE__*/ React.createElement(
    RefContext.Provider,
    {
      value: value,
    },
    children
  );
}
export function useRefs() {
  const value = useContext(RefContext);

  if (!value) {
    throw new Error(
      "useRefs must be called from within a RefContext.Provider!"
    );
  }

  return value;
}

function useSetupRefs(_ref2) {
  let { flatListRef: flatListRefProp } = _ref2;
  const props = useProps();
  const { animationConfig = DEFAULT_PROPS.animationConfig } = props;
  const propsRef = useRef(props);
  propsRef.current = props;
  const animConfig = { ...DEFAULT_PROPS.animationConfig, ...animationConfig };
  const animationConfigRef = useRef(animConfig);
  animationConfigRef.current = animConfig;
  const cellDataRef = useRef(new Map());
  const keyToIndexRef = useRef(new Map());
  const containerRef = useRef(null);
  const flatlistRefInternal = useRef(null);
  const flatlistRef = flatListRefProp || flatlistRefInternal;
  const scrollViewRef = useRef(null); // useEffect(() => {
  //   // This is a workaround for the fact that RN does not respect refs passed in
  //   // to renderScrollViewComponent underlying ScrollView (currently not used but
  //   // may need to add if we want to use reanimated scrollTo in the future)
  //   //@ts-ignore
  //   const scrollRef = flatlistRef.current?.getNativeScrollRef();
  //   if (!scrollViewRef.current) {
  //     //@ts-ignore
  //     scrollViewRef(scrollRef);
  //   }
  // }, []);

  const refs = useMemo(
    () => ({
      animationConfigRef,
      cellDataRef,
      containerRef,
      flatlistRef,
      keyToIndexRef,
      propsRef,
      scrollViewRef,
    }),
    []
  );
  return refs;
}
//# sourceMappingURL=refContext.js.map
