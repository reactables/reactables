import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { createSlice, SliceConfig, Cases } from './createSlice';
import { HubFactory } from '../Factories/HubFactory';
import { Reactable } from '../Models/Reactable';
import { Effect } from '../Models/Effect';
import { Action, ScopedEffects } from '../Models/Action';

type ActionCreatorTypeFromReducer<T> = T extends (state) => unknown
  ? () => void
  : T extends (state, action: Action<infer P>) => unknown
  ? (payload: P) => void
  : never;

const increment = (state: { count: number }) => ({
  count: state.count + 1,
});

const setCounter = (_, action: Action<number>) => ({
  count: action.payload,
});

const another = (state: unknown, action) => state;

type IncrementAction = ActionCreatorTypeFromReducer<typeof increment>;
type SetCounterAction = ActionCreatorTypeFromReducer<typeof setCounter>;
type Another = ActionCreatorTypeFromReducer<typeof another>;

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
  const { reducer, actions, actionTypes } = createSlice(sliceConfig);

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
  ) as { [K in keyof S]: (payload: unknown) => void };

  const rx = [
    hub.store({ reducer, debug, storeValue, name: sliceConfig.name }),
    actionsResult,
    hub.messages$,
  ] as Reactable<T, { [K in keyof S]: (payload?: unknown) => void }>;

  rx.actionTypes = actionTypes;

  return rx;
};

interface CounterState {
  count: number;
}

const initialState: CounterState = { count: 0 };

const RxCounter = () =>
  RxBuilder({
    initialState,
    reducers: {
      increment,
      setCounter,
      hi: (state) => state,
    },
  });

const rxCounter = RxCounter();
