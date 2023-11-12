export type TodoStatus = 'done' | 'incomplete' | 'in progress';

export interface Todo {
  id: number;
  description: string;
  status: TodoStatus;
  updating: boolean;
}

export type UpdateTodoPayload = {
  todoId: number;
  status: TodoStatus;
};

export type UpdateTodoPayloadSuccess = UpdateTodoPayload;
