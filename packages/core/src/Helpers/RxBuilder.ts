import { createSlice } from './createSlice';
import { addEffects } from './addEffects';
import { HubFactory } from '../Factories';

export const RxBuilder = {
  createSlice,
  addEffects,
  createHub: HubFactory,
};
