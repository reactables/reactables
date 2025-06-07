import { Observable } from 'rxjs';
import { useEffect, useState, useRef } from 'react';
import { Reactable, ActionObservableWithTypes, DestroyAction } from '@reactables/core';

export type HookedReactable<T> = T extends (...args: any[]) => Reactable<infer S, infer U, infer V>
  ? [S, U, Observable<S>, ActionObservableWithTypes<V>?]
  : never;

export const useReactable = <
  T,
  S extends DestroyAction,
  U extends unknown[],
  V extends Record<string, string>,
>(
  reactableFactory: (...props: U) => Reactable<T, S, V>,
  ...props: U
): HookedReactable<typeof reactableFactory> => {
  const rx = useRef<Reactable<T, S, V>>(null);

  /**
   * React Strict Mode has bugs with clean up with refs so it breaks the useReactable hook as of now
   * See Bug: https://github.com/facebook/react/issues/26315
   * See Bug: https://github.com/facebook/react/issues/24670
   * Using this recommended approach for resolving Strict Modeissue: https://react.dev/reference/react/useRef#avoiding-recreating-the-ref-contents
   */
  if (rx.current === null) {
    rx.current = reactableFactory(...props);
  }

  const [state$, actions, actions$] = rx.current;
  const [state, setState] = useState<T>();

  useEffect(() => {
    const subscription = state$.subscribe((result) => {
      setState(result);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [actions, state$]);

  return [state, actions, state$, actions$];
};
