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

const eventTicketsSlice = RxBuilder.createSlice({
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

interface EventTicketsActions {
  selectEvent: (event: EventTypes) => void;
  setQty: (qty: number) => void;
}

export const EventTickets = (
  getPriceApi: (payload: FetchPricePayload) => ObservableOrPromise<number>,
): Reactable<EventTicketsState, EventTicketsActions> => {
  const hub1 = RxBuilder.createHub();

  // Initialize observable stream for the control state
  const control$ = hub1.store({ reducer: controlsSlice.reducer });

  const controlChangeWithEffect = RxBuilder.addEffects(
    eventTicketsSlice.actions.controlChange,
    () => ({
      effects: [
        (actions$) =>
          actions$.pipe(
            switchMap(
              ({
                payload: { selectedEvent: event, qty },
              }: Action<ControlState>) => getPriceApi({ event, qty }),
            ),

            // Map success response to appropriate action
            map((price) => eventTicketsSlice.actions.fetchPriceSuccess(price)),
          ),
      ],
    }),
  );

  const hub2 = RxBuilder.createHub({
    sources: [
      control$.pipe(
        // Map state changes from control$ to trigger fetching price
        map((change) => controlChangeWithEffect(change)),
      ),
    ],
  });

  const {
    actions: { selectEvent, setQty },
  } = controlsSlice;

  return {
    state$: hub2.store({ reducer: eventTicketsSlice.reducer }),
    actions: {
      selectEvent: (event: EventTypes) => hub1.dispatch(selectEvent(event)),
      setQty: (qty: number) => hub1.dispatch(setQty(qty)),
    },
  };
};
