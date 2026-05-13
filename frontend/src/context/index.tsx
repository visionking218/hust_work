import {
  createContext,
  useCallback,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { InitState } from "../@types";
import { getInitialState } from "./initialState";

export type GlobalContextValue = {
  state: InitState;
  update: (patch: Partial<InitState>) => void;
};

const GlobalContext = createContext<GlobalContextValue | null>(null);

function ContextProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<InitState>(getInitialState);

  const update = useCallback((patch: Partial<InitState>) => {
    setState((prev) => ({ ...prev, ...patch }));
  }, []);

  const value = useMemo(() => ({ state, update }), [state, update]);

  return (
    <GlobalContext.Provider value={value}>{children}</GlobalContext.Provider>
  );
}

export { GlobalContext, ContextProvider };
