import { HubFactory } from '@hub-fx/core';
import { AbstractControlConfig } from '../Models/Configs';
import { buildHub2Source } from './buildHub2Source';
import { buildHub1Reducer } from '../Reducers';
import { hub2Reducer } from '../Reducers/Hub2/hub2Reducer';
import { formChange } from '../Actions';

export const buildForm = (
  config: AbstractControlConfig,
  hub = HubFactory(),
) => {
  const hub1Reducer = buildHub1Reducer(config);
  const hub2Source = buildHub2Source(hub1Reducer, hub);
  const hub2 = HubFactory({ sources: [hub2Source] });

  const initialState = hub2Reducer(null, formChange(hub1Reducer()));

  return hub2.store({ reducer: hub2Reducer, initialState });
};
