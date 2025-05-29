import { Observable } from 'rxjs';
import { Action } from './Action';

export type ActionCreatorTypeFromReducer<T> = T extends (state) => unknown
  ? () => void
  : T extends (state, action: Action<infer P>) => unknown
  ? (payload: P) => void
  : never;

export type ActionObservableWithTypes = Observable<Action<unknown>> & {
  types?: { [key: string]: string };
};

export type Reactable<T, S = ActionMap> = [Observable<T>, S, ActionObservableWithTypes?];

export interface ActionMap {
  [key: string | number]: (payload?: unknown) => void | ActionMap;
}
