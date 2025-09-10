import { Observable, OperatorFunction } from 'rxjs';
import { filter } from 'rxjs/operators';
import { Action } from '../Models/Action';

export const ofTypes: (types: string[]) => OperatorFunction<Action<any>, Action<any>> =
  (types: string[]) => (dispatcher$: Observable<Action<any>>) => {
    return dispatcher$.pipe(filter(({ type }) => types.includes(type)));
  };
