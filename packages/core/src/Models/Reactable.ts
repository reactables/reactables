import { Observable } from 'rxjs';
import { Action } from './Action';

export type ActionCreatorTypeFromReducer<T> = T extends (state) => unknown
  ? () => void
  : T extends (state, action: Action<infer P>) => unknown
  ? (payload: P) => void
  : never;

export type ObservableWithActionTypes<T, S> = Observable<T> & {
  types?: { [K in keyof S]: K };
};

export type Reactable<T, S = ActionMap> = [
  Observable<T>,
  S,
  ObservableWithActionTypes<Action<unknown>, S>?,
];

export interface ActionMap {
  [key: string | number]: (payload?: unknown) => void | ActionMap;
}
