import { Observable } from 'rxjs';
import { useEffect, useState, useMemo } from 'react';
import { Reactable } from '@reactables/core';

// React Strict Mode has bugs with clean up with refs so it breaks the useReactable hook as of now
// See Bug: https://github.com/facebook/react/issues/26315
// See Bug: https://github.com/facebook/react/issues/24670

export const useReactable = <T, S, U extends unknown[]>(
  reactableFactory: (...props: U) => Reactable<T, S>,
  ...props: U
): [T, S, Observable<T>] => {
  const [state$, actions] = useMemo(() => reactableFactory(...props), []);
  const [state, setState] = useState<T>();

  useEffect(() => {
    const subscription = state$.subscribe((result) => {
      setState(result);
    });

    const unsubscribe = subscription.unsubscribe.bind(subscription) as () => void;

    return unsubscribe;
  }, [state$]);

  return [state, actions, state$];
};
