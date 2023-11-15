import { Reducer, Action, HubFactory, Reactable } from '@hub-fx/core';
import {
  UpdateTodoPayload,
  UpdateTodoPayloadSuccess,
  Todo,
} from './Models/Todos';
import { switchMap, map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import React from 'react';

// ACTIONS
const SEND_TODO_STATUS_UPDATE = 'SEND_TODO_STATUS_UPDATE';
const sendTodoStatusUpdate = (
  payload: UpdateTodoPayload, // { todoId: number, status: 'done' | 'incomplete' | 'in progress' }
  // Provide the method from Todos API service for updating Todos
  updateTodoApi: (
    payload: UpdateTodoPayload,
  ) => Observable<UpdateTodoPayloadSuccess> | Promise<UpdateTodoPayloadSuccess>,
): Action<UpdateTodoPayload> => ({
  type: SEND_TODO_STATUS_UPDATE,
  payload,
  scopedEffects: {
    // Provide key so effect stream is dynamically created for SEND_TODO_STATUS_UPDATE on todo.id
    key: payload.todoId,

    // Scoped Effects to listen for update todo action and handling update todo API call
    effects: [
      (actions$: Observable<Action<UpdateTodoPayload>>) => {
        return actions$.pipe(
          // Call todo API Service - switchMap operator cancels previous pending call if a new one is initiated
          switchMap(({ payload }) => updateTodoApi(payload)),

          // Map success response to appropriate action
          map((payload) => todoStatusUpdateSuccess(payload)),
        );
      },
    ],
  },
});

const TODO_STATUS_UPDATE_SUCCESS = 'TODO_STATUS_UPDATE_SUCCESS';
const todoStatusUpdateSuccess = (
  payload: UpdateTodoPayload,
): Action<UpdateTodoPayload> => ({
  type: TODO_STATUS_UPDATE_SUCCESS,
  payload,
});

// STATE
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

// REDUCER FOR UPDATING STATE
const reducer: Reducer<TodoUpdatesState> = (state = initialState, action) => {
  switch (action?.type) {
    case SEND_TODO_STATUS_UPDATE:
      // Find todo and setting updating flag to true

      return {
        todos: state.todos.reduce((acc, todo) => {
          const { todoId } = action.payload as UpdateTodoPayload;

          const newTodo =
            todo.id === todoId ? { ...todo, updating: true } : todo;

          return acc.concat(newTodo);
        }, [] as Todo[]),
      };
    case TODO_STATUS_UPDATE_SUCCESS:
      // Find todo and mark new status and set updating flag to false

      return {
        todos: state.todos.reduce((acc, todo) => {
          const { todoId, status } = action.payload as UpdateTodoPayload;

          const newTodo =
            todo.id === todoId ? { ...todo, status, updating: false } : todo;

          return acc.concat(newTodo);
        }, [] as Todo[]),
      };
  }
  return state;
};

interface TodoUpdatesActions {
  sendTodoStatusUpdate: (payload: UpdateTodoPayload) => void;
}

export const TodoUpdates = (
  updateTodoApi: (
    payload: UpdateTodoPayload,
  ) => Observable<UpdateTodoPayloadSuccess> | Promise<UpdateTodoPayloadSuccess>,
): Reactable<TodoUpdatesState, TodoUpdatesActions> => {
  const hub = HubFactory();

  return {
    state$: hub.store({ reducer }),
    actions: {
      sendTodoStatusUpdate: (payload: UpdateTodoPayload) =>
        hub.dispatch(sendTodoStatusUpdate(payload, updateTodoApi)),
    },
  };
};
