import { ReplaySubject } from 'rxjs';
import { Reactable } from '../Models';

export interface DestroyAction {
  destroy: () => void;
}

export const storeValue = <T, S, U extends Record<string, string> = Record<string, string>>(
  reactable: Reactable<T, S, U>,
): Reactable<T, S & DestroyAction, U> => {
  const replaySubject$ = new ReplaySubject<T>(1);

  const [state$, actions, actions$] = reactable;

  const subscription = state$.subscribe((state) => replaySubject$.next(state));

  const destroy = () => subscription.unsubscribe();

  return [replaySubject$, { ...actions, destroy }, actions$];
};
