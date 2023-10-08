import { Effect } from './Effect';
export interface ScopedEffects<T> {
  key?: string | number;
  effects: Effect<T, unknown>[];
}
export interface Action<T = undefined> {
  type: string;
  payload?: T;
  scopedEffects?: ScopedEffects<T>;
}
