import { Effect } from './Effect';

export interface ScopedEffects<T> {
  key?: string | number;
  effects: Effect<T, unknown>[];
}
export type Action<T = undefined> = T extends undefined
  ? {
      type: string;
      scopedEffects?: ScopedEffects<T>;
    }
  : {
      type: string;
      scopedEffects?: ScopedEffects<T>;
      payload: T;
    };

export type ActionCreator<T> = (payload?: T) => Action<T>;
