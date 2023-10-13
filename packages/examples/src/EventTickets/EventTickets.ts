import { switchMap, map } from 'rxjs/operators';
import { Action, Reducer, HubFactory, Hub } from '@hub-fx/core';
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

export const FETCH_PRICE = 'FETCH_PRICE';
export const fetchPrice = (
  payload: FetchPricePayload,
  // Provide method for calling get price API service
  getPrice: (payload: FetchPricePayload) => Observable<number>,
): Action<FetchPricePayload, number> => ({
  type: FETCH_PRICE,
  payload,
  scopedEffects: {
    // Scoped Effects to listen for FETCH_PRICE action and handling get price API call
    effects: [
      (actions$) =>
        actions$.pipe(
          // Call get price API Service - switchMap operator cancels previous pending call if a new one is initiated
          switchMap(({ payload }) => getPrice(payload)),

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

interface EventTicketsState extends ControlState {
  calculating: boolean;
  price: number | null;
}

const initialState = {
  ...initialControlState,
  calculating: false,
  price: null,
};

// Reducer to handle price info updates
const priceReducer: Reducer<EventTicketsState> = (
  state = initialState,
  action,
) => {
  switch (action?.type) {
    case FETCH_PRICE:
      return {
        ...state,
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

// const buildObservables = (
//   hub: Hub,
//   // Provide method for calling get price API service
//   getPrice: (payload: FetchPricePayload) => Observable<number>,
// ) => {
//   // Initialize observable stream for the control state
//   const control$ = hub.store({ reducer: controlReducer });

//   // Initialize observable stream for the price info state
//   const priceInfo$ = HubFactory({
//     // Declare control$ stream as a source for priceInfo$.
//     sources: [
//       control$.pipe(
//         // Map state changes from control$ to trigger FETCH_PRICE action for the priceInfo$ stream
//         map(({ qty, selectedEvent: event }) =>
//           fetchPrice({ qty, event }, getPrice),
//         ),
//       ),
//     ],
//   }).store({ reducer: priceReducer });

//   return { control$, priceInfo$ };
// };
