import { switchMap, map } from 'rxjs/operators';
import { Action, Reactable, RxBuilder } from '@reactables/core';
import { EventTypes, FetchPricePayload } from './Models/EventTypes';
import { ObservableOrPromise } from '../Models/ObservableOrPromise';

export interface ControlState {
  selectedEvent: EventTypes;
  qty: number;
}

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

type EventTicketsActions = {
  selectEvent: (event: EventTypes) => void;
  setQty: (qty: number) => void;
};

export const RxEventTickets = (
  getPriceApi: (payload: FetchPricePayload) => ObservableOrPromise<number>,
): Reactable<EventTicketsState, EventTicketsActions> => {
  // Create a reactable for the controls
  const [rxControlsState$, rxControlsActions] = RxBuilder({
    initialState: {
      selectedEvent: EventTypes.ChiliCookOff,
      qty: 0,
    },
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

  // Create reactable for combining controls and price info.
  const [state$]: Reactable<EventTicketsState, unknown> = RxBuilder({
    // Add control changes as a source for second reactable
    sources: [
      rxControlsState$.pipe(
        map((controlsState) => ({ type: 'controlChange', payload: controlsState })),
      ),
    ],
    initialState,
    reducers: {
      controlChange: {
        reducer: (state, { payload }: Action<ControlState>) => ({
          ...state,
          controls: payload,
          calculating: true,
        }),
        effects: [
          (controlChange$) =>
            controlChange$.pipe(
              switchMap(({ payload: { selectedEvent: event, qty } }: Action<ControlState>) =>
                getPriceApi({ event, qty }),
              ),

              // Map success response to success action
              map((price) => ({ type: 'fetchPriceSuccess', payload: price })),
            ),
        ],
      },
      fetchPriceSuccess: (state, { payload }: Action<number>) => ({
        ...state,
        calculating: false,
        price: payload,
      }),
    },
  });

  return [state$, rxControlsActions];
};
