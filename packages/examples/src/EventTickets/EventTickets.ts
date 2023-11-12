import { switchMap, map } from 'rxjs/operators';
import { Action, Reducer, HubFactory, Reactable } from '@hub-fx/core';
import { Observable } from 'rxjs';
import { EventTypes, FetchPricePayload } from './Models/EventTypes';

// Actions
export const SELECT_EVENT = 'SELECT_EVENT';
export const selectEvent = (event: EventTypes): Action<EventTypes> => ({
  type: SELECT_EVENT,
  payload: event,
});

export const SET_QTY = 'SET_QTY';
export const setQty = (qty: number): Action<number> => ({
  type: SET_QTY,
  payload: qty,
});

export const FETCH_PRICE_SUCCESS = 'FETCH_PRICE_SUCCESS';
export const fetchPriceSuccess = (price: number): Action<number> => ({
  type: FETCH_PRICE_SUCCESS,
  payload: price,
});

export const CONTROL_CHANGE = 'CONTROL_CHANGE';
export const controlChange = (
  controlChange: ControlState,
  // Provide method for calling get price API service
  getPriceApi: (
    payload: FetchPricePayload,
  ) => Observable<number> | Promise<number>,
): Action<ControlState, number> => ({
  type: CONTROL_CHANGE,
  payload: controlChange,
  scopedEffects: {
    // Scoped Effects to listen for FETCH_PRICE action and handling get price API call
    effects: [
      (actions$) =>
        actions$.pipe(
          // Call get price API Service - switchMap operator cancels previous pending call if a new one is initiated
          switchMap(({ payload: { selectedEvent: event, qty } }) =>
            getPriceApi({ event, qty }),
          ),

          // Map success response to appropriate action
          map((price) => fetchPriceSuccess(price)),
        ),
    ],
  },
});

// Control State
interface ControlState {
  selectedEvent: EventTypes;
  qty: number;
}

const initialControlState: ControlState = {
  selectedEvent: EventTypes.ChiliCookOff,
  qty: 0,
};

// Reducer to handle control state updates
const controlReducer: Reducer<ControlState> = (
  state = initialControlState,
  action,
) => {
  switch (action?.type) {
    case SELECT_EVENT:
      return {
        ...state,
        selectedEvent: action.payload as EventTypes,
      };
    case SET_QTY:
      return {
        ...state,
        qty: action.payload as number,
      };
    default:
      return state;
  }
};

// Event Tickets State

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

// Reducer to handle price info updates
const eventTicketsReducer: Reducer<EventTicketsState> = (
  state = initialState,
  action,
) => {
  switch (action?.type) {
    case CONTROL_CHANGE:
      return {
        ...state,
        controls: {
          ...(action.payload as ControlState),
        },
        calculating: true,
      };
    case FETCH_PRICE_SUCCESS:
      return {
        ...state,
        calculating: false,
        price: action.payload as number,
      };
    default:
      return state;
  }
};

export const EventTickets = (
  getPriceApi: (
    payload: FetchPricePayload,
  ) => Observable<number> | Promise<number>,
): Reactable<EventTicketsState> => {
  const hub1 = HubFactory();

  // Initialize observable stream for the control state
  const control$ = hub1.store({ reducer: controlReducer });

  const hub2 = HubFactory({
    sources: [
      control$.pipe(
        // Map state changes from control$ to trigger FETCH_PRICE action for the priceInfo$ stream
        map((change) => controlChange(change, getPriceApi)),
      ),
    ],
  });

  return {
    state$: hub2.store({ reducer: eventTicketsReducer }),
    actions: {
      selectEvent: (event: EventTypes) => hub1.dispatch(selectEvent(event)),
      setQty: (qty: number) => hub1.dispatch(setQty(qty)),
    },
  };
};
