import { Observable, OperatorFunction } from 'rxjs';
import { filter } from 'rxjs/operators';
import { Action } from '../Models/Action';

export const ofType: (
  type: string,
) => OperatorFunction<Action<unknown>, Action<unknown>> =
  (type: string) => (dispatcher$: Observable<Action<unknown>>) => {
    return dispatcher$.pipe(filter((action) => action?.type === type));
  };
