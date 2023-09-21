import { OperatorFunction } from 'rxjs';
import { filter } from 'rxjs/operators';
import { Action } from '../Models/Action';

export const ofType: (type: string) => OperatorFunction<Action, Action> =
  (type: string) => (dispatcher$) => {
    return dispatcher$.pipe(filter((action) => action?.type === type));
  };
