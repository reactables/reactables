import { Observable, OperatorFunction } from 'rxjs';
import { filter } from 'rxjs/operators';
import { Action } from '../Models/Action';

export const ofTypes: (types: string[]) => OperatorFunction<Action<unknown>, Action<unknown>> =
  (types: string[]) => (dispatcher$: Observable<Action<unknown>>) => {
    return dispatcher$.pipe(filter(({ type }) => types.includes(type)));
  };
