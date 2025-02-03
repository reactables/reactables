import { fromEvent, merge, Subject } from 'rxjs';
import { map, filter, tap, takeUntil } from 'rxjs/operators';
import { Reactable, ActionMap } from '@reactables/core';
import {
  FromWorkerMessageTypes,
  ToWorkerMessageTypes,
  ActionsSchema,
  ToWorkerSourceMessage,
  ToWorkerInitMessage,
  InitializedMessage,
  FromWorkerMessage,
  StateChangeMessage,
  FromWorkerActionMessage,
  SourcesAndProps,
} from './models';

/**
 * @description creates a Reactable Interface from a worker to be used on the Client Side.
 */
export const fromWorker = <State, Actions>(worker: Worker, config?: SourcesAndProps) => {
  const destroy$ = new Subject<void>();

  /**
   * Once the Reactable is initialized on the worker side,
   * it will send an ActionsSchema to the client and `const actions` will be updated to the
   * according ActionMap the UI can call to invoke state changes.
   */
  const actions = {} as Actions;

  /**
   * Set up observable to listen for state changes emitted by worker Reactable
   */
  const state$ = fromEvent(worker, 'message').pipe(
    tap((event) => {
      /**
       * Using tap here to set up an ActionMap for the client side Reactable
       * Once the Reactable on the worker side is initialized, it will broadcast back
       * the ActionMap schema so we can create an ActionMap here on the client side
       */

      if (
        (event as MessageEvent<InitializedMessage>).data.type === FromWorkerMessageTypes.Initialized
      ) {
        const { actionsSchema } = (event as MessageEvent<InitializedMessage>).data;

        const assignActions = (source: ActionsSchema, dest: unknown, stack: string[] = []) => {
          // Recursively go through the ActionsSchema
          for (const key in source) {
            if (typeof source[key] === 'object' && source[key] !== null) {
              dest[key] = source[key] as unknown;
              assignActions(source[key], dest[key] as unknown as ActionMap, stack.concat(key));
            } else {
              // Check if there is a destroy action to handle Reactables d with `storeValue`
              let storeValueDestroyFunc: () => void;

              if (key === 'destroy' && typeof dest[key] === 'function') {
                storeValueDestroyFunc = dest[key] as () => void;
              }

              /**
               * Assigning an action function to the ActionMap to post messages back
               * to the worker
               */
              dest[key] = (payload?: unknown) => {
                //If there is a destroy action (from storeValue modifier), call it
                storeValueDestroyFunc?.();

                // Notify worker of action invoked
                worker.postMessage({
                  type: ToWorkerMessageTypes.Action,
                  action: {
                    type: stack.concat(key).join('~'),
                    payload,
                  },
                });

                if (key === 'destroy') {
                  console.log('terminate');
                  worker.terminate();
                  destroy$.next();
                  destroy$.complete();
                }
              };
            }
          }
        };

        assignActions(actionsSchema, actions);
      }
    }),
    filter(
      (event) =>
        (event as MessageEvent<FromWorkerMessage<State>>).data.type ===
        FromWorkerMessageTypes.State,
    ),
    map((event) => (event as MessageEvent<StateChangeMessage<State>>).data.state),
  );

  /**
   * Set up observable to rebroadcast actions processed by the worker Reactable
   */
  const actions$ = fromEvent(worker, 'message').pipe(
    filter(
      (event) =>
        (event as MessageEvent<FromWorkerMessage<State>>).data.type ===
        FromWorkerMessageTypes.Action,
    ),
    map((event) => (event as MessageEvent<FromWorkerActionMessage>).data.action),
  );

  /**
   * Set up observable & subscription to listen to sources on the client side
   * and post messages to the worker
   */
  merge(...(config?.sources || []))
    .pipe(takeUntil(destroy$))
    .subscribe((action) => {
      worker.postMessage({
        type: ToWorkerMessageTypes.Source,
        action,
      } as ToWorkerSourceMessage);
    });

  /**
   * Notify the worker to initialize the Reactable on worker side;
   */
  worker.postMessage({
    type: ToWorkerMessageTypes.Init,
    props: config?.props,
  } as ToWorkerInitMessage);

  return [state$, actions, actions$] as Reactable<State, Actions>;
};
