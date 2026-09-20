import { Observable, ObservedValueOf } from 'rxjs';
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
  [K in keyof S & string as `${K}$`]: Observable<Action<PayloadFromCase<S[K]>> & { type: K }>;
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
  [K in keyof T]: T[K] extends Reactable<unknown, unknown & DestroyAction, any, infer M>
    ? M
    : never;
};

export type ReactableState<RxFactory> = RxFactory extends (
  ...args: any[]
) => Reactable<infer S, any, any>
  ? S
  : never;

// Maps selector definition functions to { key: Observable<ReturnType> }
export type SelectorsFromDefs<T, Defs extends Record<string, (state: T) => unknown>> = {
  [K in keyof Defs]: Observable<ReturnType<Defs[K]>>;
};

// Extracts the .selectors object from a reactable that has called .selectors().
// Returns never if the reactable has no .selectors, or if .selectors is still the
// method (a function) rather than the resolved property map.
export type SelectorsOf<R> = R extends { selectors: infer Sel }
  ? Sel extends (...args: any[]) => any
    ? never
    : Sel
  : never;

// Maps a record of reactables to the nested selector maps inherited from
// children that have called .selectors(). Keys for children without selectors
// are omitted entirely.
export type InheritedSelectors<T extends Record<string, any>> = {
  [K in keyof T as SelectorsOf<T[K]> extends never ? never : K]: SelectorsOf<T[K]>;
};

// A Reactable tuple augmented with a resolved .selectors property.
// This is the type returned after calling .selectors() on a RxBuilderResult or
// after calling .selectors() on a CombineResult.
export type ReactableWithSelectors<
  T,
  S extends DestroyAction,
  U,
  M extends Record<string, unknown>,
  Sel extends Record<string, unknown>,
> = Reactable<T, S, U, M> & { selectors: Sel };

// What RxBuilder returns: the standard Reactable tuple plus a .selectors()
// method whose defs parameter is typed against the reactable's state type T.
export type RxBuilderResult<
  T,
  S extends DestroyAction,
  U,
  M extends Record<string, unknown>,
> = Reactable<T, S, U, M> & {
  selectors<Defs extends Record<string, (state: T) => unknown>>(
    defs: Defs,
  ): ReactableWithSelectors<T, S, U, M, SelectorsFromDefs<T, Defs>>;
};

// Convenience alias for the combined state shape produced by combine().
export type CombinedState<T extends Record<string, Reactable<unknown, unknown & DestroyAction>>> = {
  [K in keyof T]: ObservedValueOf<T[K][0]>;
};
