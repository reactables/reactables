import { Observable } from 'rxjs';

export interface Reactable<T, S = ActionMap> {
  state$: Observable<T>;
  actions: S;
}

export interface ActionMap {
  [key: string | number]: (payload?: unknown) => void | ActionMap;
}
