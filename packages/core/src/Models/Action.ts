import { Effect } from './Effect';
export interface ScopedEffects<T, S> {
  key?: string | number;
  effects: Effect<T, S>[];
}
export interface Action<T = undefined, S = undefined> extends ActionPayload<T> {
  type: string;
  scopedEffects?: ScopedEffects<T, S>;
}

export interface ActionPayload<T> {
  payload?: T;
}
