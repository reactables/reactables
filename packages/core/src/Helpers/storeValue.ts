import { ReplaySubject } from 'rxjs';
import { Reactable } from '../Models';

export interface DestroyAction {
  destroy: () => void;
}

export const storeValue = <T, S>(
  reactable: Reactable<T, S & { destroy?: () => void }>,
): Reactable<T, S & DestroyAction> => {
  const replaySubject$ = new ReplaySubject<T>(1);

  const [state$, actions, actions$] = reactable;

  const subscription = state$.subscribe((state) => replaySubject$.next(state));

  const destroy = () => {
    console.log('unsubscribe store value');
    subscription.unsubscribe();
  };

  actions.destroy = destroy;

  return [replaySubject$, actions as S & DestroyAction, actions$];
};
