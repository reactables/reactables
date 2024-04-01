import { getFlowTestParams } from './getFlowTestParams';
import { RxBuilder } from '@reactables/core';

describe('getFlowTestParams', () => {
  it('should return flow setup args', () => {
    const rx = RxBuilder({ initialState: null, reducers: {} });
    const { actionMarbles, expectedMarbles } = getFlowTestParams(
      rx,
      () =>
        Array(5).fill(() => {
          console.log;
        }) as (() => void)[],
    );

    expect(actionMarbles).toBe('5000ms 4999ms a 4999ms a 4999ms a 4999ms a 4999ms a 4999ms a');

    expect(expectedMarbles).toBe('34999ms (a|)');
  });
});
