import { Effect } from './Effect';

export interface ScopedEffects {
  key?: string | number;
  effects: Effect<any, any>[];
}
export type Action<T = undefined> = T extends undefined
  ? {
      type: string;
      scopedEffects?: ScopedEffects;
    }
  : {
      type: string;
      scopedEffects?: ScopedEffects;
      payload: T;
    };

export type ActionCreator<T> = (payload?: T) => Action<T>;
