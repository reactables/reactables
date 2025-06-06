import { Action, RxBuilder, ScopedEffects } from '@reactables/core';
import { UpdateTodoPayload, UpdateTodoPayloadSuccess, Todo } from './Models/Todos';
import { switchMap, map } from 'rxjs/operators';
import { ObservableOrPromise } from '../Models/ObservableOrPromise';

interface TodoUpdatesState {
  todos: Todo[];
}

export const initialState: TodoUpdatesState = {
  todos: [
    {
      id: 1,
      description: 'Pick Up Bart',
      status: 'incomplete',
      updating: false,
    },
    {
      id: 2,
      description: 'Moe the lawn',
      status: 'incomplete',
      updating: false,
    },
  ],
};

export const RxTodoUpdates = (
  updateTodoApi: (payload: UpdateTodoPayload) => ObservableOrPromise<UpdateTodoPayloadSuccess>,
) =>
  RxBuilder({
    initialState,
    reducers: {
      sendTodoStatusUpdate: {
        reducer: (state, { payload: { todoId } }: Action<UpdateTodoPayload>) => ({
          todos: state.todos.reduce(
            (acc, todo) => acc.concat(todo.id === todoId ? { ...todo, updating: true } : todo),
            [] as Todo[],
          ),
        }),
        effects: (payload: UpdateTodoPayload): ScopedEffects<UpdateTodoPayload> => ({
          key: payload.todoId,
          effects: [
            (todoUpdates$) => {
              return todoUpdates$.pipe(
                // Call todo API Service - switchMap operator cancels previous pending call if a new one is initiated
                switchMap(({ payload }) => updateTodoApi(payload)),

                // Map success response to appropriate action
                map((payload) => ({ type: 'todoStatusUpdateSuccess', payload })),
              );
            },
          ],
        }),
      },
      todoStatusUpdateSuccess: (
        state,
        { payload: { todoId, status } }: Action<UpdateTodoPayload>,
      ) => ({
        todos: state.todos.reduce(
          (acc, todo) =>
            acc.concat(todo.id === todoId ? { ...todo, status, updating: false } : todo),
          [] as Todo[],
        ),
      }),
    },
  });
