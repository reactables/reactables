import { TestScheduler } from 'rxjs/testing';
import { FlowTest } from '../Models/flow.model';
import { getFlowTestParams } from './getFlowTestParams';

export const testFlow = <T, S, U extends unknown[], V = T>(flowTest: FlowTest<T, S, U, V>) => {
  const assertFunc = flowTest.assertFunc
    ? flowTest.assertFunc
    : (actual, expected) => {
        expect(actual).toEqual(expected);
      };
  it(flowTest.description, () => {
    const testScheduler = new TestScheduler(assertFunc);

    testScheduler.run(({ expectObservable, cold }) => {
      const deps =
        (flowTest.factories.dependencies && flowTest.factories.dependencies()) || ([] as U);
      const { actionMarbles, actions, expectedMarbles, lastState$ } = getFlowTestParams(
        flowTest.factories.reactable(...deps),
        flowTest.factories.flow,
      );

      let index = 0;

      cold(actionMarbles, {
        a: () => {
          actions[index]();
          index++;
        },
      }).subscribe((action) => {
        action();
      });

      expectObservable(flowTest.operator ? lastState$.pipe(flowTest.operator) : lastState$).toBe(
        expectedMarbles,
        {
          a: flowTest.expectedResult,
        },
      );
    });
  });
};
