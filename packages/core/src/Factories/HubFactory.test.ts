import { Observable, of, Subscription } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { switchMap, delay } from 'rxjs/operators';
import { HubFactory } from './HubFactory';
import { Action } from '../Models/Action';
import { Hub } from '../Models/Hub';
import { TEST_ACTION, TEST_ACTION_SUCCESS } from '../Testing';
import { ofType } from '../Operators/ofType';
import { switchMapTestEffect, debounceTestEffect } from '../Testing/Effects';

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
    it;
    it('should detect a test action dispatch', () => {
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
    it;
    it('should detect a generic effect', () => {
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

    it('should detect a scoped effect', () => {
      testScheduler.run(({ expectObservable, cold }) => {
        const action: Action<string> = {
          type: TEST_ACTION,
          payload: 'test action with scoped effect',
          scopedEffects: { effects: [switchMapTestEffect] },
        };

        subscription = cold('a', { a: action }).subscribe((action) =>
          hub.dispatch(action),
        );

        expectObservable(hub.messages$).toBe('a 99ms b', {
          a: action,
          b: {
            type: TEST_ACTION_SUCCESS,
            payload: 'test action with scoped effect switchMap succeeded',
          },
        });
      });
    });

    it('switchMap in effect should cancel previous inner observables', () => {
      testScheduler.run(({ expectObservable, cold }) => {
        const action: Action<string> = {
          type: TEST_ACTION,
          payload: 'test action with scoped effect',
          scopedEffects: { effects: [switchMapTestEffect] },
        };

        subscription = cold('a 49ms b 149ms c', {
          a: action,
          b: action,
          c: action,
        }).subscribe((action) => hub.dispatch(action));

        expectObservable(hub.messages$).toBe('a 49ms b 99ms c 49ms d 99ms e', {
          a: action,
          b: action,
          c: {
            type: TEST_ACTION_SUCCESS,
            payload: 'test action with scoped effect switchMap succeeded',
          },
          d: action,
          e: {
            type: TEST_ACTION_SUCCESS,
            payload: 'test action with scoped effect switchMap succeeded',
          },
        });
      });
    });
  });
});
