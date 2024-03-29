import { RxEventTickets, initialState, EventTicketsState } from './RxEventTickets';
import { Subscription, of, Observable } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { delay } from 'rxjs/operators';
import { FetchPricePayload, EventTypes } from './Models/EventTypes';

describe('RxEventTickets', () => {
  let testScheduler: TestScheduler;
  let subscription: Subscription;

  const initialControlState = {
    selectedEvent: EventTypes.ChiliCookOff,
    qty: 0,
  };

  beforeEach(() => {
    testScheduler = new TestScheduler((actual, expected) => {
      expect(actual).toEqual(expected);
    });
  });
  afterEach(() => {
    subscription?.unsubscribe();
  });

  it('should calculate event prices and set calculating and control states', () => {
    testScheduler.run(({ expectObservable, cold }) => {
      const mockApi = ({ qty }: FetchPricePayload): Observable<number> =>
        of(qty * 100).pipe(delay(4));
      const [state$, { setQty, selectEvent }] = RxEventTickets(mockApi);

      subscription = cold('-------a---b', {
        a: () => setQty(1),
        b: () => selectEvent(EventTypes.ItchyAndScratchyMovie),
      }).subscribe((action) => action());

      expectObservable(state$).toBe('(y)-z--a---b---c', {
        y: {
          ...initialState,
          controls: initialControlState,
          calculating: true,
        },
        z: { ...initialState, controls: initialControlState, price: 0 },
        a: {
          controls: {
            selectedEvent: EventTypes.ChiliCookOff,
            qty: 1,
          },
          calculating: true,
          price: 0,
        },
        b: {
          controls: {
            selectedEvent: EventTypes.ItchyAndScratchyMovie,
            qty: 1,
          },
          calculating: true,
          price: 0,
        },
        c: {
          controls: {
            selectedEvent: EventTypes.ItchyAndScratchyMovie,
            qty: 1,
          },
          calculating: false,
          price: 100,
        },
      } as { [key: string]: EventTicketsState });
    });
  });
});
