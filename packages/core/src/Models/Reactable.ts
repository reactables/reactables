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

export type Selectors<T> = { [key: string]: (state: T) => any };

export type StateObservable<
  State,
  SelectorsDict extends Selectors<State> | undefined = undefined,
> = {
  selectors?: SelectorsDict;
} & Observable<State>;

export type Reactable<
  State,
  Actions extends DestroyAction = ActionMap & DestroyAction,
  Types = unknown,
  SelectorsDict extends Selectors<State> | undefined = undefined,
> = [StateObservable<State, SelectorsDict>, Actions, ActionObservableWithTypes<Types>];

export interface ActionMap {
  [key: string | number]: (payload?: unknown) => void | ActionMap;
}

export type ActionObservableWithTypes<T> = Observable<Action<any>> & {
  types: T;
  ofTypes: (types: Array<string>) => Observable<Action<any>>;
};

export type ReactableState<RxFactory> = RxFactory extends (
  ...args: any[]
) => Reactable<infer S, any, any>
  ? S
  : never;
