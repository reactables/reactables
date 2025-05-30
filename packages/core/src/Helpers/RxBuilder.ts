import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { createSlice, SliceConfig, Cases } from './createSlice';
import { HubFactory } from '../Factories/HubFactory';
import {
  Reactable,
  ActionCreatorTypeFromReducer,
  ActionObservableWithTypes,
} from '../Models/Reactable';
import { Effect } from '../Models/Effect';
import { Action, ScopedEffects } from '../Models/Action';
import { combine } from './combine';
import { createActionTypeString } from './createActionTypeString';

export interface EffectsAndSources {
  effects?: Effect<unknown, unknown>[];
  sources?: Observable<Action<unknown>>[] | { [key: string]: Observable<unknown> };
}

export interface RxConfig<T, S extends Cases<T>> extends SliceConfig<T, S>, EffectsAndSources {
  debug?: boolean;
  /**@deprecated Use storeValue modifier instead to add store value behaviour to reactable */
  storeValue?: boolean;
}

export const RxBuilder = <T, S extends Cases<T>>({
  effects,
  sources = [],
  debug = false,
  storeValue = false,
  ...sliceConfig
}: RxConfig<T, S>) => {
  const { reducer, actions } = createSlice(sliceConfig);

  // Check sources and see if need to add effects
  if (!Array.isArray(sources)) {
    sources = Object.entries(sources).map(([key, obs$]) =>
      obs$.pipe(map((value) => ({ type: key, payload: value }))),
    );
  }

  sources = sources.map((action$) =>
    action$.pipe(
      map((action) => {
        const _case = sliceConfig.reducers[action.type];

        if (_case && typeof _case !== 'function' && _case.effects) {
          const effects =
            typeof _case.effects === 'function'
              ? _case.effects
              : ((() => ({ effects: _case.effects })) as (
                  payload?: unknown,
                ) => ScopedEffects<unknown>);

          return {
            ...action,
            scopedEffects: effects(action.payload),
          };
        }

        return action;
      }),
    ),
  );

  const hub = HubFactory({ effects, sources });

  const actionsResult = Object.fromEntries(
    Object.entries(actions).map(([key, actionCreator]) => [
      key,
      (payload: unknown) => {
        hub.dispatch(actionCreator(payload));
      },
    ]),
  ) as { [K in keyof S]: ActionCreatorTypeFromReducer<S[K]> };

  const types = createActionTypeString(actions);

  const actions$ = hub.messages$ as ActionObservableWithTypes<typeof types>;

  actions$.types = createActionTypeString(actions);

  const rx = [
    hub.store({ reducer, debug, storeValue, name: sliceConfig.name }),
    actionsResult,
    actions$,
  ] as Reactable<T, { [K in keyof S]: ActionCreatorTypeFromReducer<S[K]> }, typeof types>;

  return rx;
};

interface CounterState {
  count: number;
}

const RxCounter = () =>
  RxBuilder({
    initialState: { count: 0 } as CounterState,
    reducers: {
      increment: (state: { count: number }) => ({
        count: state.count + 1,
      }),
      setCounter: (_, action: Action<number>) => ({
        count: action.payload,
      }),
      hi: (state) => state,
      'some wierd reducer': (state) => state,
    },
  });

const [, actions, actions$] = RxCounter();

actions.setCounter(3);

actions$.types['some wierd reducer'];
actions$.types.increment;

const RxToggle = () =>
  RxBuilder({
    initialState: false,
    reducers: {
      toggle: (state) => !state,
      toggleOn: () => true,
      toggleOff: () => false,
      setToggle: (_, { payload }: Action<boolean>) => payload,
    },
  });

const [, toggleActions, toggleActions$] = RxToggle();

toggleActions.setToggle(false);
toggleActions.toggleOn();
toggleActions$.types.setToggle;

const RxCombined = () => {
  const rxCounter = RxCounter();
  const rxToggle = RxToggle();

  return combine({
    counter: rxCounter,
    toggle: rxToggle,
  });
};

const [combinedState, combinedActions, combinedActions$] = RxCombined();

const [, doubleCombinedActions, doubleCombinedActions$] = combine({
  doubleCombined: RxCombined(),
  counter: RxCounter(),
});

combinedActions$.types['[toggle] - toggleOn'];
