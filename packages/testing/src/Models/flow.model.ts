import { Reactable } from '@reactables/core';
import { OperatorFunction } from 'rxjs';

export type Flow = (() => void)[];

export type FlowFactory<T> = (actions: T) => Flow;

export interface FlowTest<T, S, U extends unknown[] = undefined, V = T> {
  description: string;
  factories: {
    flow: FlowFactory<S>;
    reactable: (...deps: U) => Reactable<T, S>;
    dependencies?: () => U;
  };
  expectedResult: V;
  operator?: OperatorFunction<T, V | T>;
  assertFunc?: (actual, expected) => void | boolean;
}
