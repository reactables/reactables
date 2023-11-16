import { switchMap, map } from 'rxjs/operators';
import { Action, Reactable, RxBuilder } from '@hub-fx/core';
import { EventTypes, FetchPricePayload } from './Models/EventTypes';
import { ControlState, controlsSlice } from './Controls';
import { ObservableOrPromise } from '../Models/ObservableOrPromise';

export interface EventTicketsState {
  controls: ControlState;
  calculating: boolean;
  price: number | null;
}

export const initialState: EventTicketsState = {
  controls: null,
  calculating: false,
  price: null,
};

interface EventTicketsActions {
  selectEvent: (event: EventTypes) => void;
  setQty: (qty: number) => void;
}

export const EventTickets = (
  getPriceApi: (payload: FetchPricePayload) => ObservableOrPromise<number>,
): Reactable<EventTicketsState, EventTicketsActions> => {
  // Create Slice to generate actions and reducers
  const { reducer, actions } = RxBuilder.createSlice({
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

  // Add effect for calling Api
  const controlChangeWithEffect = RxBuilder.addEffects(actions.controlChange, () => ({
    effects: [
      (actions$) =>
        actions$.pipe(
          switchMap(({ payload: { selectedEvent: event, qty } }: Action<ControlState>) =>
            getPriceApi({ event, qty }),
          ),

          // Map success response to success action
          map((price) => actions.fetchPriceSuccess(price)),
        ),
    ],
  }));

  // Create Hub 1 and Store 1
  const hub1 = RxBuilder.createHub();
  const hub1Store$ = hub1.store({ reducer: controlsSlice.reducer });

  // Create Hub 2 and Store 2 with Hub 1 Store as a source
  const hub2 = RxBuilder.createHub({
    sources: [
      hub1Store$.pipe(
        // Map state changes from control$ to trigger fetching price
        map((change) => controlChangeWithEffect(change)),
      ),
    ],
  });

  const {
    actions: { selectEvent, setQty },
  } = controlsSlice;

  return {
    state$: hub2.store({ reducer }),
    actions: {
      selectEvent: (event: EventTypes) => hub1.dispatch(selectEvent(event)),
      setQty: (qty: number) => hub1.dispatch(setQty(qty)),
    },
  };
};
