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
  M extends Record<string, unknown> = Record<string, unknown>,
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
  [K in keyof S & string]: Observable<Action<PayloadFromCase<S[K]>> & { type: K }>;
};

export type ActionObservableWithTypes<
  T,
  M extends Record<string, unknown> = Record<string, unknown>,
> = Observable<Action<any>> & {
  types: T;
  ofTypes: (types: Array<string>) => Observable<Action<any>>;
  actionMap: M;
};

export type CombinedActionMapType<
  T extends Record<string, Reactable<unknown, unknown & DestroyAction>>,
> = {
  [K in keyof T]: T[K] extends Reactable<unknown, unknown & DestroyAction, any, infer M> ? M : never;
};

export type ReactableState<RxFactory> = RxFactory extends (
  ...args: any[]
) => Reactable<infer S, any, any>
  ? S
  : never;
