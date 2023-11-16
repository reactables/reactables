import { Action, Reactable, RxBuilder } from '@hub-fx/core';
import {
  UpdateTodoPayload,
  UpdateTodoPayloadSuccess,
  Todo,
} from './Models/Todos';
import { switchMap, map } from 'rxjs/operators';
import { Observable } from 'rxjs';
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

interface TodoUpdatesActions {
  sendTodoStatusUpdate: (payload: UpdateTodoPayload) => void;
}

export const TodoUpdates = (
  updateTodoApi: (
    payload: UpdateTodoPayload,
  ) => ObservableOrPromise<UpdateTodoPayloadSuccess>,
): Reactable<TodoUpdatesState, TodoUpdatesActions> => {
  const updateTodosSlice = RxBuilder.createSlice({
    name: 'updateTodos',
    initialState,
    reducers: {
      sendTodoStatusUpdate: (
        state,
        { payload }: Action<UpdateTodoPayload>,
      ) => ({
        todos: state.todos.reduce((acc, todo) => {
          const { todoId } = payload;

          const newTodo =
            todo.id === todoId ? { ...todo, updating: true } : todo;

          return acc.concat(newTodo);
        }, [] as Todo[]),
      }),
      todoStatusUpdateSuccess: (
        state,
        { payload }: Action<UpdateTodoPayload>,
      ) => ({
        todos: state.todos.reduce((acc, todo) => {
          const { todoId, status } = payload;

          const newTodo =
            todo.id === todoId ? { ...todo, status, updating: false } : todo;

          return acc.concat(newTodo);
        }, [] as Todo[]),
      }),
    },
  });

  const { reducer, actions } = updateTodosSlice;

  // Add effect for calling Api
  const sendTodoStatusUpdate = RxBuilder.addEffects(
    actions.sendTodoStatusUpdate,
    (payload: UpdateTodoPayload) => ({
      key: payload.todoId,
      effects: [
        (actions$: Observable<Action<UpdateTodoPayload>>) => {
          return actions$.pipe(
            // Call todo API Service - switchMap operator cancels previous pending call if a new one is initiated
            switchMap(({ payload }) => updateTodoApi(payload)),

            // Map success response to appropriate action
            map((payload) => actions.todoStatusUpdateSuccess(payload)),
          );
        },
      ],
    }),
  );

  // Create hub and initialize store
  const hub = RxBuilder.createHub();

  return {
    state$: hub.store({ reducer }),
    actions: {
      sendTodoStatusUpdate: (payload: UpdateTodoPayload) =>
        hub.dispatch(sendTodoStatusUpdate(payload)),
    },
  };
};
