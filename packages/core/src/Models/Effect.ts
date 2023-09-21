import { OperatorFunction } from 'rxjs';
import { Action } from './Action';

export type Effect<T, S> = OperatorFunction<Action<T>, Action<S>>;
