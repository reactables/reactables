import { Action, ActionCreator, ScopedEffects } from '../Models/Action';
import { Effect } from '../Models/Effect';
import { ofTypes } from '../Operators/ofTypes';
import { Observable } from 'rxjs';

export const addEffects = <T>(
  actionCreator: ActionCreator<T>,
  scopedEffects: (payload: T) => ScopedEffects<T>,
): ActionCreator<T> => {
  return (payload?: T) => ({
    ...actionCreator(payload),
    scopedEffects: scopedEffects(payload),
  });
};

export const createEffect = <T, S>(
  action: string,
  operator: (actions$: Observable<Action<T>>) => Observable<Action<S>>,
): Effect<T, S> => {
  return (dispatcher$) => {
    return dispatcher$.pipe(ofTypes([action]), operator);
  };
};
