import { Observable, Subject } from 'rxjs';
import { last, takeUntil } from 'rxjs/operators';
import { Reactable } from '@reactables/core';
import { FlowFactory } from '../Models/flow.model';

export interface FlowTestParams<T> {
  actionMarbles: string;
  actions: (() => void)[];
  expectedMarbles: string;
  lastState$: Observable<T>;
}

export const getFlowTestParams = <T, S>(
  [state$, rxActions]: Reactable<T, S>,
  flowFactory: FlowFactory<S>,
  { actionInterval }: { actionInterval: number } = {
    actionInterval: 5000,
  },
): FlowTestParams<T> => {
  const actionsComplete$ = new Subject();

  const actions = flowFactory(rxActions).concat(() => {
    actionsComplete$.next(undefined);
    actionsComplete$.complete();
  });

  return {
    actionMarbles: actions.reduce(
      (acc) => acc.concat(` ${actionInterval - 1}ms a`),
      `${actionInterval}ms`,
    ),
    actions,
    expectedMarbles: `${actionInterval * actions.length + actionInterval - 1}ms (a|)`,
    lastState$: state$.pipe(takeUntil(actionsComplete$), last()),
  };
};
