import { Observable } from 'rxjs';
import { useEffect, useState, useRef } from 'react';
import { Reactable, Action } from '@reactables/core';

export type HookedReactable<T, S> = [T, S, Observable<T>, Observable<Action<unknown>>?];

export const useReactable = <T, S, U extends unknown[]>(
  reactableFactory: (...props: U) => Reactable<T, S>,
  ...props: U
): HookedReactable<T, S> => {
  const rx = useRef<Reactable<T, S>>(null);

  if (rx.current === null) {
    rx.current = reactableFactory(...props);
  }

  const [state$, actions, actions$] = rx.current;
  const [state, setState] = useState<T>();

  useEffect(() => {
    const subscription = state$.subscribe((result) => {
      setState(result);
    });

    return () => subscription.unsubscribe();
  }, [state$]);

  return [state, actions, state$, actions$];
};
