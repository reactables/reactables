import { Observable } from 'rxjs';
export type ObservableOrPromise<T> = Observable<T> | Promise<T>;
