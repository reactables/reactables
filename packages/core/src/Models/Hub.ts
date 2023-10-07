import { Action } from './Action';
import { Effect } from './Effect';
import { Observable } from 'rxjs';

export type Reducer<T> = (state?: T, action?: Action<unknown>) => T;

export interface StoreConfig<T> {
  reducer: Reducer<T>;
  initialState?: T;
  name?: string;
  debug?: boolean;
}

export type Dispatcher = <T>(...actions: Action<T>[]) => void;

export interface HubConfig {
  effects?: Effect<unknown, unknown>[];
  sources?: Observable<Action<unknown>>[];
}
export interface Hub {
  messages$: Observable<Action<unknown>>;
  store: <T>(config: StoreConfig<T>) => Observable<T>;
  dispatch: Dispatcher;
}
