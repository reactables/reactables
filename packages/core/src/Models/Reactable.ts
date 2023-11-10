import { Observable } from 'rxjs';

export interface Reactable<T, S> {
  state$: Observable<T>;
  actions: S;
}
