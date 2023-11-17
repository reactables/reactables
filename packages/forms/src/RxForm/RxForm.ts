import { RxBuilder } from '@hub-fx/core';
import { getHub1Slice } from './getHub1Slice';
import { buildFormState } from '../Helpers/buildFormState';
import { AbstractControlConfig } from '../Models';
import { buildHub2Source } from '../Helpers/buildHub2Source';

export const RxForm = (config: AbstractControlConfig) => {
  const initialState = buildFormState(config);
  const hub1Slice = getHub1Slice(initialState);

  const hub1 = RxBuilder.createHub();
  const sourceForHub2$ = buildHub2Source(hub1Slice.reducer, hub1);
};
