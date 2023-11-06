import { useCallback, useState } from "react";

export function useToggle(initValue: boolean = false) {
  const [state, setState] = useState(initValue);
  const toggle = useCallback(() => setState((prev) => !prev), []);
  const setTrue = useCallback(() => setState(true), []);
  const setFalse = useCallback(() => setState(false), []);
  return { state, toggle, setState, setTrue, setFalse };
}
