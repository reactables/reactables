import { switchMap, map } from 'rxjs/operators';
import {
  Action,
  HubFactory,
  Reactable,
  addEffects,
  createSlice,
} from '@hub-fx/core';
import { Observable } from 'rxjs';
import { EventTypes, FetchPricePayload } from './Models/EventTypes';
import { ControlState, controlsSlice } from './Controls';

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

  const controlChangeWithEffect = addEffects(
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

  const hub2 = HubFactory({
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
