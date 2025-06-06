import { Observable } from 'rxjs';
import { Action } from './Action';
import { DestroyAction } from '../Helpers';

export type ActionCreatorTypeFromReducer<T> = T extends (state: any) => unknown
  ? () => void
  : T extends (state, action: Action<infer P>) => unknown
  ? (payload: P) => void
  : T extends { reducer: (state: any) => unknown }
  ? () => void
  : T extends { reducer: (state: any, action: Action<infer P>) => unknown }
  ? (payload: P) => void
  : never;

export type ActionObservableWithTypes<T extends Record<string, string>> = Observable<
  Action<unknown>
> & {
  types?: T;
  ofTypes?: (types: Array<keyof T>) => Observable<Action<unknown>>;
};

export type Reactable<
  T,
  S extends DestroyAction = ActionMap & DestroyAction,
  U extends Record<string, string> = Record<string, string>,
> = [Observable<T>, S, ActionObservableWithTypes<U>?];

export interface ActionMap {
  [key: string | number]: (payload?: unknown) => void | ActionMap;
}
