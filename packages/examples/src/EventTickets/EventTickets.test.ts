import { EventTickets, initialState, EventTicketsState } from './EventTickets';
import { Subscription, of, Observable } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { delay } from 'rxjs/operators';
import { FetchPricePayload, EventTypes } from './Models/EventTypes';

describe('EventTickets', () => {
  let testScheduler: TestScheduler;
  let subscription: Subscription;

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
      const {
        state$,
        actions: { setQty, selectEvent },
      } = EventTickets(mockApi);

      subscription = cold('-------a---b', {
        a: () => setQty(1),
        b: () => selectEvent(EventTypes.ItchyAndScratchyMovie),
      }).subscribe((action) => action());

      expectObservable(state$).toBe('(xy)z--a---b---c', {
        x: initialState,
        y: { ...initialState, calculating: true },
        z: { ...initialState, price: 0 },
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
