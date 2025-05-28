import { Observable } from 'rxjs';
import { Action } from './Action';

export type Reactable<T, S = ActionMap> = [Observable<T>, S, Observable<Action<unknown>>?] & {
  actionTypes: { [K in keyof S]: string };
};

export interface ActionMap {
  [key: string | number]: (payload?: unknown) => void | ActionMap;
}
