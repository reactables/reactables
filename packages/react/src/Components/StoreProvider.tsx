import React from 'react';
import { Reactable } from '@reactables/core';

export const StoreContext = React.createContext(null) as React.Context<Reactable<unknown, unknown>>;

interface StoreProviderProps<T, S> {
  rxStore: Reactable<T, S>;
  children?: React.ReactNode;
}

export const StoreProvider = <T, S>({ rxStore, children }: StoreProviderProps<T, S>) => {
  return <StoreContext.Provider value={rxStore}>{rxStore && children}</StoreContext.Provider>;
};
