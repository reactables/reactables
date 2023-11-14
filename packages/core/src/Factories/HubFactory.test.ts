import { Observable, of, Subscription } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { switchMap, delay } from 'rxjs/operators';
import { HubFactory } from './HubFactory';
import { Action } from '../Models/Action';
import { Hub, Reducer } from '../Models/Hub';
import { TEST_ACTION, TEST_ACTION_SUCCESS } from '../Testing/Actions';
import { ofType } from '../Operators/ofType';
import { switchMapTestEffect, debounceTestEffect } from '../Testing/Effects';

describe('HubFactory', () => {
  let testScheduler: TestScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler((actual, expected) => {
      expect(actual).toEqual(expected);
    });
  });

  describe('messages$', () => {
    enum InputStreamMode {
      Dispatching = 'dispatching',
      Sourcing = 'sourcing',
    }

    const testMessages = (mode: InputStreamMode) => {
      let hub: Hub;
      let subscription: Subscription;

      beforeEach(() => {
        hub = HubFactory();
      });

      afterEach(() => {
        subscription?.unsubscribe();
      });

      it('should detect a test action', () => {
        testScheduler.run(({ expectObservable, cold }) => {
          const action = { type: TEST_ACTION, payload: 'test' };
          const actionB = { type: 'TEST_ACTION_B', payload: 'testb' };

          const input$ = cold('a--b', { a: action, b: actionB });

          if (mode === InputStreamMode.Dispatching) {
            subscription = input$.subscribe(hub.dispatch);
          } else {
            hub = HubFactory({ sources: [input$] });
          }

          expectObservable(hub.messages$).toBe('a--b', {
            a: action,
            b: actionB,
          });
        });
      });

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

          const action = { type: TEST_ACTION, payload: 'test' };
          const actionB = { type: 'TEST_ACTION_B', payload: 'testb' };

          const input$ = cold('a-b', { a: action, b: actionB });

          if (mode === InputStreamMode.Dispatching) {
            hub = HubFactory({ effects: [effect] });
            subscription = input$.subscribe(hub.dispatch);
          } else {
            hub = HubFactory({ effects: [effect], sources: [input$] });
          }

          expectObservable(hub.messages$).toBe('a-b 1997ms c', {
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

          const input$ = cold('a', { a: action });

          if (mode === InputStreamMode.Dispatching) {
            subscription = input$.subscribe(hub.dispatch);
          } else {
            hub = HubFactory({ sources: [input$] });
          }

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

          const input$ = cold('a 49ms b 149ms c', {
            a: action,
            b: action,
            c: action,
          });

          if (mode === InputStreamMode.Dispatching) {
            subscription = input$.subscribe(hub.dispatch);
          } else {
            hub = HubFactory({ sources: [input$] });
          }

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

      it('should handle more than one effect each independently', () => {
        testScheduler.run(({ expectObservable, cold }) => {
          const action: Action<string> = {
            type: TEST_ACTION,
            payload: 'test action with more that one effect',
            scopedEffects: {
              effects: [switchMapTestEffect, debounceTestEffect],
            },
          };

          const input$ = cold('a 49ms b 149ms c', {
            a: action,
            b: action,
            c: action,
          });

          if (mode === InputStreamMode.Dispatching) {
            subscription = input$.subscribe(hub.dispatch);
          } else {
            hub = HubFactory({ sources: [input$] });
          }

          expectObservable(hub.messages$).toBe('a 49ms b 99ms c 49ms d 9ms e 89ms f 59ms g', {
            a: action, // first dispatch
            b: action, // dispatch at 50
            c: {
              type: TEST_ACTION_SUCCESS,
              payload: 'test action with more that one effect switchMap succeeded',
            },
            d: action, // dispatch at 200
            e: {
              type: TEST_ACTION_SUCCESS,
              payload: 'test action with more that one effect debounceTime and mergeMap succeeded',
            },
            f: {
              type: TEST_ACTION_SUCCESS,
              payload: 'test action with more that one effect switchMap succeeded',
            },
            g: {
              type: TEST_ACTION_SUCCESS,
              payload: 'test action with more that one effect debounceTime and mergeMap succeeded',
            },
          });
        });
      });

      it('should handle two action with unique signatures independently', () => {
        testScheduler.run(({ expectObservable, cold }) => {
          const action: Action<string> = {
            type: TEST_ACTION,
            payload: 'test action no key',
            scopedEffects: {
              effects: [switchMapTestEffect, debounceTestEffect],
            },
          };

          const actionTwo: Action<string> = {
            type: TEST_ACTION,
            payload: 'test action key two',
            scopedEffects: { key: 'two', effects: [switchMapTestEffect] },
          };

          const input$ = cold('a 124ms b 4ms c 69ms d', {
            a: action,
            b: action,
            c: actionTwo,
            d: action,
          });

          if (mode === InputStreamMode.Dispatching) {
            subscription = input$.subscribe(hub.dispatch);
          } else {
            hub = HubFactory({ sources: [input$] });
          }

          expectObservable(hub.messages$).toBe(
            'a 99ms b 24ms c 4ms d 29ms e 39ms f 29ms g 54ms h 14ms i 59ms j',
            {
              // 0
              a: action,

              //100
              b: {
                type: TEST_ACTION_SUCCESS,
                payload: 'test action no key switchMap succeeded',
              },

              //125
              c: action,

              //130
              d: actionTwo,

              //160
              e: {
                type: TEST_ACTION_SUCCESS,
                payload: 'test action no key debounceTime and mergeMap succeeded',
              },

              //200
              f: action,

              //230
              g: {
                type: TEST_ACTION_SUCCESS,
                payload: 'test action key two switchMap succeeded',
              },

              //285
              h: {
                type: TEST_ACTION_SUCCESS,
                payload: 'test action no key debounceTime and mergeMap succeeded',
              },

              //300
              i: {
                type: TEST_ACTION_SUCCESS,
                payload: 'test action no key switchMap succeeded',
              },

              //360
              j: {
                type: TEST_ACTION_SUCCESS,
                payload: 'test action no key debounceTime and mergeMap succeeded',
              },
            },
          );
        });
      });
    };

    describe(InputStreamMode.Dispatching, () => {
      testMessages(InputStreamMode.Dispatching);
    });

    describe(InputStreamMode.Sourcing, () => {
      testMessages(InputStreamMode.Sourcing);
    });
  });

  describe('store', () => {
    let hub: Hub;
    let subscription: Subscription;

    beforeEach(() => {
      hub = HubFactory();
    });

    afterEach(() => {
      subscription?.unsubscribe();
    });
    const INCREMENT = 'INCREMENT';
    const increment = (): Action => ({ type: INCREMENT });

    const initialState = { count: 0 };
    const reducer: Reducer<{ count: number }> = (state = initialState, action) => {
      switch (action?.type) {
        case INCREMENT:
          return {
            ...state,
            count: state.count + 1,
          };
        default:
          return state;
      }
    };

    it('create an observable and emit initial value', () => {
      testScheduler.run(({ expectObservable }) => {
        const state$ = hub.store({ reducer });

        expectObservable(state$).toBe('a', { a: initialState });
      });
    });

    it('should response to messages and update', () => {
      testScheduler.run(({ expectObservable, cold }) => {
        const state$ = hub.store({ reducer });
        const action = increment();
        subscription = cold('-a-b-c', {
          a: action,
          b: action,
          c: action,
        }).subscribe(hub.dispatch);

        expectObservable(state$).toBe('0 1-2-3', [
          { count: 0 },
          { count: 1 },
          { count: 2 },
          { count: 3 },
        ]);
      });
    });
  });
});
