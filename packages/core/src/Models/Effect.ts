import { OperatorFunction } from 'rxjs';
import { Action, AnyAction } from './Action';

export type Effect =
  | OperatorFunction<{ type: string; payload: any }, AnyAction>
  | OperatorFunction<Action, AnyAction>;
