import { Observable } from 'rxjs';

export interface Reactable<T> {
  state$: Observable<T>;
  actions: {
    [key: string]: (payload?: unknown) => void;
  };
}
