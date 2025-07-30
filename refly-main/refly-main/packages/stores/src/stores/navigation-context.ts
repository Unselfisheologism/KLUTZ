import { NavigationContext } from '../types/common';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { useShallow } from 'zustand/react/shallow';

export interface NavigationContextState {
  // state
  navigationContext: NavigationContext;

  // method
  setNavigationContext: (val: NavigationContext) => void;
}

export const defaultState = {
  navigationContext: undefined,
};

export const useNavigationContextStore = create<NavigationContextState>()(
  devtools((set) => ({
    ...defaultState,

    setNavigationContext: (val: NavigationContext) =>
      set((state) => ({ ...state, navigationContext: val })),
  })),
);

export const useNavigationContextStoreShallow = <T>(
  selector: (state: NavigationContextState) => T,
) => {
  return useNavigationContextStore(useShallow(selector));
};
