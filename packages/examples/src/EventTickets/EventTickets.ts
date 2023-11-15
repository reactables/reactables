import { switchMap, map } from 'rxjs/operators';
import {
  Action,
  Reducer,
  HubFactory,
  Reactable,
  createSlice,
} from '@hub-fx/core';
import { Observable } from 'rxjs';
import { EventTypes, FetchPricePayload } from './Models/EventTypes';
// Control State
interface ControlState {
  selectedEvent: EventTypes;
  qty: number;
}

const initialControlState: ControlState = {
  selectedEvent: EventTypes.ChiliCookOff,
  qty: 0,
};

const controlsSlice = createSlice({
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

export interface EventTicketsState {
  controls: ControlState;
  calculating: boolean;
  price: number | null;
}

export const initialState: EventTicketsState = {
  controls: {
    ...initialControlState,
  },
  calculating: false,
  price: null,
};

const eventTicketsSlice = createSlice({
  name: 'eventTickets',
  initialState,
  reducers: {
    controlChange: (state, { payload }: Action<ControlState>) => ({
      ...state,
      controls: payload,
      calculating: true,
    }),
    fetchPriceSuccess: (state, { payload }: Action<number>) => ({
      ...state,
      calculating: false,
      price: payload,
    }),
  },
});

export const controlChange = (
  controlChange: ControlState,
  // Provide method for calling get price API service
  getPriceApi: (
    payload: FetchPricePayload,
  ) => Observable<number> | Promise<number>,
): Action<ControlState> => {
  return {
    ...(eventTicketsSlice.actions.controlChange(
      controlChange,
    ) as Action<ControlState>),
    scopedEffects: {
      effects: [
        (actions$) =>
          actions$.pipe(
            // Call get price API Service - switchMap operator cancels previous pending call if a new one is initiated
            switchMap(({ payload: { selectedEvent: event, qty } }) =>
              getPriceApi({ event, qty }),
            ),

            // Map success response to appropriate action
            map((price) => eventTicketsSlice.actions.fetchPriceSuccess(price)),
          ),
      ],
    },
  };
};

interface EventTicketsActions {
  selectEvent: (event: EventTypes) => void;
  setQty: (qty: number) => void;
}

export const EventTickets = (
  getPriceApi: (
    payload: FetchPricePayload,
  ) => Observable<number> | Promise<number>,
): Reactable<EventTicketsState, EventTicketsActions> => {
  const hub1 = HubFactory();

  // Initialize observable stream for the control state
  const control$ = hub1.store({ reducer: controlsSlice.reducer });

  const hub2 = HubFactory({
    sources: [
      control$.pipe(
        // Map state changes from control$ to trigger FETCH_PRICE action for the priceInfo$ stream
        map((change) => controlChange(change, getPriceApi)),
      ),
    ],
  });

  return {
    state$: hub2.store({ reducer: eventTicketsSlice.reducer }),
    actions: {
      selectEvent: (event: EventTypes) =>
        hub1.dispatch(controlsSlice.actions.selectEvent(event)),
      setQty: (qty: number) => hub1.dispatch(controlsSlice.actions.setQty(qty)),
    },
  };
};
