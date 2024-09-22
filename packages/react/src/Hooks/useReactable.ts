import { Observable } from 'rxjs';
import { useEffect, useState, useMemo } from 'react';
import { Reactable, Action } from '@reactables/core';

export type HookedReactable<T, S> = [T, S, Observable<T>, Observable<Action<unknown>>?];

export const useReactable = <T, S, U extends unknown[]>(
  reactableFactory: (...props: U) => Reactable<T, S>,
  ...props: U
): HookedReactable<T, S> => {
  const [state$, actions, messages$] = useMemo(() => reactableFactory(...props), []);
  const [state, setState] = useState<T>();

  useEffect(() => {
    const subscription = state$.subscribe((result) => {
      setState(result);
    });

    return () => {
      // Adding setTimeout fixes the issue.
      // React Strict Mode has bugs with clean up with refs so it breaks the useReactable hook as of now
      // See Bug: https://github.com/facebook/react/issues/26315
      // See Bug: https://github.com/facebook/react/issues/24670
      setTimeout(() => {
        subscription.unsubscribe();
      }, 0);
    };
  }, [state$]);

  return [state, actions, state$, messages$];
};
