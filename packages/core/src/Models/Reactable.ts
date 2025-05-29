import { Observable } from 'rxjs';
import { Action } from './Action';

export type ActionCreatorTypeFromReducer<T> = T extends (state) => unknown
  ? () => void
  : T extends (state, action: Action<infer P>) => unknown
  ? (payload: P) => void
  : never;

export type ActionObservableWithTypes<T extends Record<string, string>> = Observable<
  Action<unknown>
> & {
  types?: T;
};

export type Reactable<
  T,
  S = ActionMap,
  U extends Record<string, string> = Record<string, string>,
> = [Observable<T>, S, ActionObservableWithTypes<U>?];

export interface ActionMap {
  [key: string | number]: (payload?: unknown) => void | ActionMap;
}
