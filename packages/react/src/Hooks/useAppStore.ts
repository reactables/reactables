import { useContext } from 'react';
import { ActionMap } from '@reactables/core';
import { useReactable } from './useReactable';
import { StoreContext } from '../Components/StoreProvider';
import { Observable } from 'rxjs';

export const useAppStore = <T, S = ActionMap>() => {
  const rxStore$ = useContext(StoreContext);
  const rxStore = useReactable(() => rxStore$);

  return rxStore as [T, S, Observable<T>];
};
