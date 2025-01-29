import { Reactable, Action } from '@reactables/core';
import { Observable } from 'rxjs';

export type SourcesAndProps = {
  props?: Record<string, unknown>;
  sources?: Observable<Action<unknown>>[];
};

export type RxFactoryConfig<T = undefined> = {
  deps?: Record<string, unknown>;
  reducers?: Record<string, (state: T, action?: Action<unknown>) => T>;
} & SourcesAndProps;

export type ReactableFactory<State, Actions> = (
  config?: RxFactoryConfig<State>,
) => Reactable<State, Actions>;
/**
 * MESSAGES TO THE WORKER
 */
export enum ToWorkerMessageTypes {
  Init = 'Init',
  Action = 'Action',
  Source = 'Source',
}

export type ToWorkerMessage = ToWorkerInitMessage | ToWorkerActionMessage | ToWorkerSourceMessage;

export interface ToWorkerInitMessage {
  type: ToWorkerMessageTypes.Init;
  props?: Record<string, unknown>;
}

export interface ToWorkerActionMessage {
  type: ToWorkerMessageTypes.Action;
  action: { type: string; payload: unknown };
}

export interface ToWorkerSourceMessage {
  type: ToWorkerMessageTypes.Source;
  action: { type: string; payload: unknown };
}

/**
 * MESSAGES FROM WORKER
 */
export enum FromWorkerMessageTypes {
  Initialized = 'Initialized',
  State = 'State',
  Action = 'Action',
}

export interface StateChangeMessage<State> {
  type: FromWorkerMessageTypes.State;
  state: State;
}

export type FromWorkerMessage<T> =
  | StateChangeMessage<T>
  | FromWorkerActionMessage
  | InitializedMessage;

export interface FromWorkerActionMessage {
  type: FromWorkerMessageTypes.Action;
  action: { type: string; payload: unknown };
}
export interface InitializedMessage {
  type: FromWorkerMessageTypes.Initialized;
  actionsSchema: ActionsSchema;
}

export interface ActionsSchema {
  [key: string]: null | ActionsSchema;
}
