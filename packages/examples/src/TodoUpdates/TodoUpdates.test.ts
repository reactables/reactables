import { TodoUpdates, initialState } from './TodoUpdates';
import { Observable, Subscription, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { TestScheduler } from 'rxjs/testing';
import { UpdateTodoPayload } from './Models/Todos';

describe('TodoUpdates', () => {
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

  it('should update todo statuses and handle updating state', () => {
    testScheduler.run(({ expectObservable, cold }) => {
      const mockApi = (
        payload: UpdateTodoPayload,
      ): Observable<UpdateTodoPayload> => of(payload).pipe(delay(2));

      const {
        state$,
        actions: { sendTodoStatusUpdate },
      } = TodoUpdates(mockApi);

      subscription = cold('--a---b', {
        a: () =>
          sendTodoStatusUpdate({
            todoId: 1,
            status: 'in progress',
          }),

        b: () =>
          sendTodoStatusUpdate({
            todoId: 2,
            status: 'done',
          }),
      }).subscribe((action) => action());

      expectObservable(state$.pipe(map(({ todos }) => todos))).toBe(
        'a-b-c-d-e',
        {
          a: initialState.todos,
          b: [
            {
              id: 1,
              description: 'Pick Up Bart',
              status: 'incomplete',
              updating: true,
            },
            {
              id: 2,
              description: 'Moe the lawn',
              status: 'incomplete',
              updating: false,
            },
          ],
          c: [
            {
              id: 1,
              description: 'Pick Up Bart',
              status: 'in progress',
              updating: false,
            },
            {
              id: 2,
              description: 'Moe the lawn',
              status: 'incomplete',
              updating: false,
            },
          ],
          d: [
            {
              id: 1,
              description: 'Pick Up Bart',
              status: 'in progress',
              updating: false,
            },
            {
              id: 2,
              description: 'Moe the lawn',
              status: 'incomplete',
              updating: true,
            },
          ],
          e: [
            {
              id: 1,
              description: 'Pick Up Bart',
              status: 'in progress',
              updating: false,
            },
            {
              id: 2,
              description: 'Moe the lawn',
              status: 'done',
              updating: false,
            },
          ],
        },
      );
    });
  });
});
