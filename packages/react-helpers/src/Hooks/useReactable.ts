import { useEffect, useState, useRef } from 'react';
import { Reactable, ActionMap } from '@reactables/core';

// React Strict Mode has bugs with clean up with refs so it breaks the useReactable hook as of now
// See Bug: https://github.com/facebook/react/issues/26315
// See Bug: https://github.com/facebook/react/issues/24670

export const useReactable = <T, S extends ActionMap>(reactable: Reactable<T, S>) => {
  const { state$, actions } = useRef(reactable).current;
  const [state, setState] = useState<T>();

  useEffect(() => {
    const subscription = state$.subscribe((result) => {
      setState(result);
    });

    const unsubscribe = subscription.unsubscribe.bind(subscription) as () => void;

    return unsubscribe;
  }, [state$]);

  return { state, actions };
};
