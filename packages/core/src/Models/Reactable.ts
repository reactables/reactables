import { Observable } from 'rxjs';
import { Action } from './Action';
import { DestroyAction } from '../Helpers';

export type ActionCreatorTypeFromReducer<T> = T extends (state: any) => unknown
  ? () => void
  : T extends (state: any, action: Action<infer P>) => unknown
  ? (payload: P) => void
  : T extends { reducer: (state: any) => unknown }
  ? () => void
  : T extends { reducer: (state: any, action: Action<infer P>) => unknown }
  ? (payload: P) => void
  : never;

export type Reactable<T, S extends DestroyAction = ActionMap & DestroyAction, U = unknown> = [
  Observable<T>,
  S,
  ActionObservableWithTypes<U>,
];

export interface ActionMap {
  [key: string | number]: (payload?: unknown) => void | ActionMap;
}

export type ActionObservableWithTypes<T> = Observable<Action<unknown>> & {
  types: T;
  ofTypes: (types: Array<string>) => Observable<Action<unknown>>;
};

export type ReactableState<RxFactory> = RxFactory extends (
  ...args: any[]
) => Reactable<infer S, any, any>
  ? S
  : never;
