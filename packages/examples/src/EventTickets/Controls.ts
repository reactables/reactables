import { Action, RxBuilder } from '@hub-fx/core';
import { EventTypes } from './Models/EventTypes';

// Control State
export interface ControlState {
  selectedEvent: EventTypes;
  qty: number;
}

export const initialControlState: ControlState = {
  selectedEvent: EventTypes.ChiliCookOff,
  qty: 0,
};

export const controlsSlice = RxBuilder.createSlice({
  name: 'controls',
  initialState: initialControlState,
  reducers: {
    selectEvent: (state, { payload }: Action<EventTypes>) => ({
      ...state,
      selectedEvent: payload,
    }),
    setQty: (state, { payload }: Action<number>) => ({
      ...state,
      qty: payload,
    }),
  },
});
