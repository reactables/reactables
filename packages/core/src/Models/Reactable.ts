import { Observable } from 'rxjs';

export type Reactable<T, S = ActionMap> = [Observable<T>, S];

export interface ActionMap {
  [key: string | number]: (payload?: unknown) => void | ActionMap;
}
