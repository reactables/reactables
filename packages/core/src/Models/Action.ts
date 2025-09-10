import { Effect } from './Effect';

export interface ScopedEffects {
  key?: string | number;
  effects: Effect[];
}
export type Action<T = undefined> = T extends undefined
  ? {
      type: string;
      scopedEffects?: ScopedEffects;
      payload?: T;
    }
  : {
      type: string;
      scopedEffects?: ScopedEffects;
      payload: T;
    };

export type AnyAction = Action<any> | Action;

export type ActionCreator<T> = (payload?: T) => Action<T>;
