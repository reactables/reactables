import { Effect } from './Effect';
export interface ScopedEffects<T, S> {
  key?: string | number;
  effects: Effect<T, S>[];
}
export interface Action<T = undefined, S = undefined> {
  type: string;
  scopedEffects?: ScopedEffects<T, S>;
  payload?: T;
}
