import { Action } from '../Models/Action';
import { Effect } from '../Models/Effect';
import { ofType } from '../Operators/ofType';
import { Observable } from 'rxjs';
export const createEffect = <T, S>(
  action: string,
  operator: (actions$: Observable<Action<T>>) => Observable<Action<S>>,
): Effect<T, S> => {
  return (dispatcher$) => {
    return dispatcher$.pipe(ofType(action), operator);
  };
};
