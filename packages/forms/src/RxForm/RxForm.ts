import { RxBuilder } from '@hub-fx/core';
import { getHub1Slice } from './getHub1Slice';
import { buildFormState } from '../Helpers/buildFormState';
import { AbstractControlConfig } from '../Models';

export const RxForm = (config: AbstractControlConfig) => {
  const initialState = buildFormState(config);
  const hub1Slice = getHub1Slice(initialState);

  const hub1 = RxBuilder.createHub();
  const hub1Store$ = hub1.store({ reducer: hub1Slice.reducer });
};
