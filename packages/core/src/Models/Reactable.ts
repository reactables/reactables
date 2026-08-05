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

export type Reactable<
  T,
  S extends DestroyAction = ActionMap & DestroyAction,
  U = unknown,
  M extends Record<string, Observable<Action<any>>> = Record<string, Observable<Action<any>>>,
> = [Observable<T>, S, ActionObservableWithTypes<U, M>];

export interface ActionMap {
  [key: string | number]: (payload?: unknown) => void | ActionMap;
}

export type PayloadFromCase<T> = T extends (state: any, action: Action<infer P>) => unknown
  ? P
  : T extends { reducer: (state: any, action: Action<infer P>) => unknown }
  ? P
  : undefined;

export type ActionMapType<S> = {
  [K in keyof S & string]: Observable<Action<PayloadFromCase<S[K]>>>;
};

export type ActionObservableWithTypes<
  T,
  M extends Record<string, Observable<Action<any>>> = Record<string, Observable<Action<any>>>,
> = Observable<Action<any>> & {
  types: T;
  ofTypes: (types: Array<string>) => Observable<Action<any>>;
  actionMap: M;
};

export type ReactableState<RxFactory> = RxFactory extends (
  ...args: any[]
) => Reactable<infer S, any, any>
  ? S
  : never;
