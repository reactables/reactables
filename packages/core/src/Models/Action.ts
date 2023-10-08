import { Effect } from './Effect';
export interface ScopedEffects<T, S> {
  key?: string | number;
  effects: Effect<T, S>[];
}
export interface Action<T = undefined, S = undefined> {
  type: string;
  payload?: T;
  scopedEffects?: ScopedEffects<T, S>;
}
