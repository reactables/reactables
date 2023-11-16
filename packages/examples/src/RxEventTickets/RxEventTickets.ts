import { switchMap, map } from 'rxjs/operators';
import { Action, Reactable, RxBuilder, ActionMap } from '@hub-fx/core';
import { EventTypes, FetchPricePayload } from './Models/EventTypes';
import { ControlState, controlsSlice } from './controlsSlice';
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

interface EventTicketsActions extends ActionMap {
  selectEvent: (event: EventTypes) => void;
  setQty: (qty: number) => void;
}

export const RxEventTickets = (
  getPriceApi: (payload: FetchPricePayload) => ObservableOrPromise<number>,
): Reactable<EventTicketsState, EventTicketsActions> => {
  // Create Slice to generate actions and reducers
  const { reducer, actions } = RxBuilder.createSlice({
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

  // Add effect to action for calling Api
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

  // Create first hub for controls
  const _controlsHub = RxBuilder.createHub();
  const _controls$ = _controlsHub.store({ reducer: controlsSlice.reducer });

  // Create second hub with first hub Store as a source
  const hub = RxBuilder.createHub({
    sources: [
      _controls$.pipe(
        // Map state changes from control$ to trigger fetching price
        map((change) => controlChangeWithEffect(change)),
      ),
    ],
  });

  const {
    actions: { selectEvent, setQty },
  } = controlsSlice;

  return {
    state$: hub.store({ reducer }),
    actions: {
      selectEvent: (event: EventTypes) => _controlsHub.dispatch(selectEvent(event)),
      setQty: (qty: number) => _controlsHub.dispatch(setQty(qty)),
    },
  };
};
