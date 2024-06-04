import { Observable } from 'rxjs';
import { Action } from './Action';

export type Reactable<T, S = ActionMap> = [Observable<T>, S, Observable<Action<unknown>>?];

export interface ActionMap {
  [key: string | number]: (payload?: unknown) => void | ActionMap;
}
