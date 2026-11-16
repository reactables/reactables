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

// Maps selector definition functions to { key: (...extraArgs) => Observable<ReturnType> }.
// Each selector can accept (state, ...args) — the state is supplied internally from the
// reactive stream; callers only pass the extra args.
export type SelectFromDefs<T, Defs extends Record<string, (state: T, ...args: any[]) => unknown>> = {
  [K in keyof Defs]: Defs[K] extends (state: T, ...args: infer Args) => infer R
    ? (...args: Args) => Observable<R>
    : never;
};

// Extracts the .select object from a reactable that has called .select().
// Returns never if the reactable has no .select, or if .select is still the
// method (a function) rather than the resolved property map.
export type SelectOf<R> = R extends { select: infer Sel }
  ? Sel extends (...args: any[]) => any
    ? never
    : Sel
  : never;

// Maps a record of reactables to the nested select maps inherited from
// children that have called .select(). Keys for children without select are omitted.
export type InheritedSelectors<T extends Record<string, any>> = {
  [K in keyof T as SelectOf<T[K]> extends never ? never : K]: SelectOf<T[K]>;
};

// A Reactable tuple augmented with a resolved .select property.
// This is the type returned after calling .select() on a RxBuilderResult or combine result.
export type ReactableWithSelect<
  T,
  S extends DestroyAction,
  U,
  M extends Record<string, unknown>,
  Sel extends Record<string, unknown>,
> = Reactable<T, S, U, M> & { select: Sel };

// What RxBuilder returns: the standard Reactable tuple plus a .selectors()
// method whose defs parameter is typed against the reactable's state type T.
// Calling .selectors(defs) resolves the .select property on the returned tuple.
export type RxBuilderResult<
  T,
  S extends DestroyAction,
  U,
  M extends Record<string, unknown>,
> = Reactable<T, S, U, M> & {
  selectors<Defs extends Record<string, (state: T, ...args: any[]) => unknown>>(
    defs: Defs,
  ): ReactableWithSelect<T, S, U, M, SelectFromDefs<T, Defs>>;
};

// Convenience alias for the combined state shape produced by combine().
export type CombinedState<T extends Record<string, Reactable<unknown, unknown & DestroyAction>>> = {
  [K in keyof T]: ObservedValueOf<T[K][0]>;
};
