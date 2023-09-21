import { createEffect } from '../Helpers/createEffect';
import { Observable, Subscription, of } from 'rxjs';
import { delay, switchMap } from 'rxjs/operators';
import { Action } from '../Models/Action';
import { HubFactory } from './HubFactory';
import { Hub, Reducer } from '../Models';
import { switchMapTestEffect, debounceTestEffect } from '../Testing/Effects';
import { TEST_ACTION, TEST_ACTION_SUCCESS } from '../Testing/Actions';

describe('HubFactory', () => {
  describe('messages', () => {
    let messages = [];
    let dispatch: (action: Action<unknown>) => void;
    let messages$: Observable<Action<unknown>>;
    let subscription: Subscription;

    const assertMessages = (
      expectedMessages: Action<unknown>[],
      done: jest.DoneCallback,
      timeout = 1000,
    ) => {
      setTimeout(() => {
        expect(messages).toEqual(expectedMessages);
        done();
      }, timeout);
    };

    const staggeredDispatch = (
      action: Action<unknown>,
      intervals: number[],
    ) => {
      intervals.forEach((interval) => {
        setTimeout(() => {
          dispatch(action);
        }, interval);
      });
    };

    beforeEach(() => {
      const hub = HubFactory();
      dispatch = hub.dispatch;
      messages$ = hub.messages$;
      messages = [];
      subscription = messages$.subscribe((message) => {
        messages = messages.concat(message);
      });
    });

    afterEach(() => {
      subscription.unsubscribe();
    });

    it('should detect a test action dispatch', (done) => {
      const action = { type: TEST_ACTION, payload: 'test' };

      dispatch({ type: TEST_ACTION, payload: 'test' });

      assertMessages([action], done);
    });

    it('should detect a generic effect', (done) => {
      const effect$ = createEffect(
        TEST_ACTION,
        (action$: Observable<Action<string>>) =>
          action$.pipe(
            switchMap((action) =>
              of({
                type: TEST_ACTION_SUCCESS,
                payload: action.payload + ' hi',
              }).pipe(delay(2000)),
            ),
          ),
      );

      const { messages$, dispatch } = HubFactory({ effects: [effect$] });

      const subscription = messages$.subscribe((message) => {
        if (message.type === TEST_ACTION_SUCCESS) {
          expect(message.type).toBe(TEST_ACTION_SUCCESS);
          expect((<Action<string>>message).payload).toBe('test hi');
          done();
          subscription.unsubscribe();
        }
      });

      dispatch({ type: TEST_ACTION, payload: 'test' });
    });

    describe('scoped effects', () => {
      it('should detect a scoped effect', (done) => {
        const action: Action<string> = {
          type: TEST_ACTION,
          payload: 'test action with scoped effect',
          scopedEffects: { effects: [switchMapTestEffect] },
        };

        dispatch(action);
        assertMessages(
          [
            action,
            {
              type: TEST_ACTION_SUCCESS,
              payload: 'test action with scoped effect switchMap succeeded',
            },
          ],
          done,
        );
      });

      it('switchMap in effect should cancel previous inner observables', (done) => {
        const action: Action<string> = {
          type: TEST_ACTION,
          payload: 'test action with scoped effect',
          scopedEffects: { effects: [switchMapTestEffect] },
        };

        staggeredDispatch(action, [0, 50, 200]);

        assertMessages(
          [
            action, // first dispatch
            action, // dispatch at 50
            {
              type: TEST_ACTION_SUCCESS,
              payload: 'test action with scoped effect switchMap succeeded',
            },
            action, // dispatch at 200
            {
              type: TEST_ACTION_SUCCESS,
              payload: 'test action with scoped effect switchMap succeeded',
            },
          ],
          done,
        );
      });

      it('should handle more than one effect each independently', (done) => {
        const action: Action<string> = {
          type: TEST_ACTION,
          payload: 'test action with more that one effect',
          scopedEffects: { effects: [switchMapTestEffect, debounceTestEffect] },
        };

        staggeredDispatch(action, [0, 50, 200]);

        assertMessages(
          [
            action, // first dispatch
            action, // dispatch at 50
            {
              type: TEST_ACTION_SUCCESS,
              payload:
                'test action with more that one effect switchMap succeeded',
            },
            action, // dispatch at 200
            {
              type: TEST_ACTION_SUCCESS,
              payload:
                'test action with more that one effect debounceTime and mergeMap succeeded',
            },
            {
              type: TEST_ACTION_SUCCESS,
              payload:
                'test action with more that one effect switchMap succeeded',
            },
            {
              type: TEST_ACTION_SUCCESS,
              payload:
                'test action with more that one effect debounceTime and mergeMap succeeded',
            },
          ],
          done,
        );
      });

      it('should handle two action with unique signatures independently', (done) => {
        const action: Action<string> = {
          type: TEST_ACTION,
          payload: 'test action no key',
          scopedEffects: { effects: [switchMapTestEffect, debounceTestEffect] },
        };
        const actionTwo: Action<string> = {
          type: TEST_ACTION,
          payload: 'test action key two',
          scopedEffects: { key: 'two', effects: [switchMapTestEffect] },
        };
        staggeredDispatch(action, [0, 125, 200]);
        staggeredDispatch(actionTwo, [130]);

        assertMessages(
          [
            // 0
            action,

            //100
            {
              type: TEST_ACTION_SUCCESS,
              payload: 'test action no key switchMap succeeded',
            },

            //125
            action,

            //130
            actionTwo,

            //160
            {
              type: TEST_ACTION_SUCCESS,
              payload: 'test action no key debounceTime and mergeMap succeeded',
            },

            //200
            action,

            //230
            {
              type: TEST_ACTION_SUCCESS,
              payload: 'test action key two switchMap succeeded',
            },

            //285
            {
              type: TEST_ACTION_SUCCESS,
              payload: 'test action no key debounceTime and mergeMap succeeded',
            },

            //300
            {
              type: TEST_ACTION_SUCCESS,
              payload: 'test action no key switchMap succeeded',
            },

            //360
            {
              type: TEST_ACTION_SUCCESS,
              payload: 'test action no key debounceTime and mergeMap succeeded',
            },
          ],
          done,
        );
      });
    });
  });

  describe('store', () => {
    const INCREMENT = 'INCREMENT';
    const increment = (): Action => ({ type: INCREMENT });

    const initialState = { count: 0 };
    const reducer: Reducer<{ count: number }> = (
      state = initialState,
      action,
    ) => {
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
    let hub: Hub;
    let subscription: Subscription;
    let states: { count: number }[];

    const assertStates = (
      expectedStates: { count: number }[],
      done: jest.DoneCallback,
      timeout = 1000,
    ) => {
      setTimeout(() => {
        expect(states).toEqual(expectedStates);
        done();
      }, timeout);
    };

    beforeEach(() => {
      hub = HubFactory();
      states = [];
    });

    afterEach(() => {
      subscription.unsubscribe();
    });

    it('create an observable and emit initial value', (done) => {
      const state$ = hub.store({ reducer });

      subscription = state$.subscribe((result) => {
        expect(result).toEqual(initialState);
        done();
      });
    });

    it('respond to messages and update state', (done) => {
      const state$ = hub.store({ reducer });

      subscription = state$.subscribe((result) => {
        states = states.concat(result);
      });

      const action = increment();

      hub.dispatch(action);
      hub.dispatch(action);
      hub.dispatch(action);

      assertStates(
        [{ count: 0 }, { count: 1 }, { count: 2 }, { count: 3 }],
        done,
      );
    });
  });
});
