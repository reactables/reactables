import { Observable, of, Subscription } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { switchMap, delay } from 'rxjs/operators';
import { HubFactory } from './HubFactory';
import { Hub } from '../Models';
import { TEST_ACTION, TEST_ACTION_SUCCESS } from '../Testing';
import { ofType } from '../Operators/ofType';

describe('HubFactory', () => {
  describe('messages$', () => {
    let hub: Hub;
    let testScheduler: TestScheduler;
    let subscription: Subscription;

    beforeEach(() => {
      testScheduler = new TestScheduler((actual, expected) => {
        expect(actual).toEqual(expected);
      });
      hub = HubFactory();
    });

    afterEach(() => {
      subscription?.unsubscribe();
    });

    it('it should detect a test action dispatch', () => {
      testScheduler.run(({ expectObservable, cold }) => {
        const source = hub.messages$;
        const action = { type: TEST_ACTION, payload: 'test' };
        const actionB = { type: 'TEST_ACTION_B', payload: 'testb' };

        subscription = cold('a--b', { a: action, b: actionB }).subscribe(
          (action) => hub.dispatch(action),
        );

        expectObservable(source).toBe('a--b', { a: action, b: actionB });
      });
    });

    it('it should detect a generic effect', () => {
      testScheduler.run(({ expectObservable, cold }) => {
        const successAction = {
          type: TEST_ACTION_SUCCESS,
          payload: 'test action success',
        };
        const effect = (action$: Observable<unknown>) =>
          action$.pipe(
            ofType(TEST_ACTION),
            switchMap(() => of(successAction).pipe(delay(2000))),
          );

        const { messages$, dispatch } = HubFactory({ effects: [effect] });
        const action = { type: TEST_ACTION, payload: 'test' };
        const actionB = { type: 'TEST_ACTION_B', payload: 'testb' };

        subscription = cold('a-b', { a: action, b: actionB }).subscribe(
          (action) => dispatch(action),
        );

        expectObservable(messages$).toBe('a-b 1997ms c', {
          a: action,
          b: actionB,
          c: successAction,
        });
      });
    });
  });
});
