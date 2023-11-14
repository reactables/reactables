import { map } from 'rxjs';
import { createSlice, SliceConfig, Cases } from './createSlice';
import { HubFactory } from '../Factories/HubFactory';
import { HubConfig } from '../Models/Hub';
import { Reactable } from '../Models/Reactable';

export interface RxConfig<T, S extends Cases<T>> extends SliceConfig<T, S>, HubConfig {
  debug?: boolean;
}

export const RxBuilder = <T, S extends Cases<T>>({
  effects,
  sources = [],
  debug = false,
  ...sliceConfig
}: RxConfig<T, S>) => {
  const { reducer, actions } = createSlice(sliceConfig);

  // Check sources and see if need to add effects
  sources = sources.map((action$) =>
    action$.pipe(
      map((action) => {
        const _case = sliceConfig.reducers[action.type];

        if (typeof _case !== 'function' && _case.effects) {
          return {
            ...action,
            scopedEffects: _case.effects(action.payload),
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

  return {
    state$: hub.store({ reducer, debug }),
    actions: actionsResult,
  } as Reactable<T, { [K in keyof S]: (payload?: unknown) => void }>;
};
