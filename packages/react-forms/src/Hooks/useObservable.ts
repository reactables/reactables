import { useEffect, useState, useRef } from 'react';
import { Observable } from 'rxjs';

export const useObservable = <T>(obs$: Observable<T>) => {
  const currentObs$ = useRef(obs$).current;
  const [state, setState] = useState<T | undefined>(undefined);

  useEffect(() => {
    const subscription = currentObs$.subscribe((result) => {
      setState(result);
    });

    const unsubscribe = subscription.unsubscribe.bind(
      subscription,
    ) as () => void;

    return unsubscribe;
  }, []);

  return state;
};
