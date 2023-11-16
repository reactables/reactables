import { createSlice } from './createSlice';
import { addEffects } from './addEffects';
import { HubFactory } from '../Factories';

const RxBuilder = {
  createSlice,
  addEffects,
  createHub: HubFactory,
};

export default RxBuilder;
