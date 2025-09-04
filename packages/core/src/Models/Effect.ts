import { OperatorFunction } from 'rxjs';
import { Action, AnyAction } from './Action';

export type Effect = OperatorFunction<Action<any>, AnyAction> | OperatorFunction<Action, AnyAction>;
