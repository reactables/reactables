import { Action, ActionCreator, ScopedEffects } from '../Models/Action';
import { Effect } from '../Models/Effect';
import { ofType } from '../Operators/ofType';
import { Observable } from 'rxjs';

export const addEffects = <T>(
  actionCreator: ActionCreator<T>,
  scopedEffects: ScopedEffects<T>,
): ActionCreator<T> => {
  return (payload?: T) => ({
    ...actionCreator(payload),
    scopedEffects,
  });
};

export const createEffect = <T, S>(
  action: string,
  operator: (actions$: Observable<Action<T>>) => Observable<Action<S>>,
): Effect<T, S> => {
  return (dispatcher$) => {
    return dispatcher$.pipe(ofType(action), operator);
  };
};
