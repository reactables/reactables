import { Reactable, ActionMap, Action } from '@reactables/core';
import { ReplaySubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
  ToWorkerMessage,
  ToWorkerMessageTypes,
  FromWorkerMessageTypes,
  ActionsSchema,
} from './models';

/**
 * @description
 * Creates a Reactable to handle business logic on the workers side
 */
export const toWorker = (
  RxFactory: (config) => Reactable<unknown, unknown>,
  config?: object,
): void => {
  let reactable: Reactable<unknown, unknown>;

  const destroy$ = new Subject<void>();

  /**
   * Subject to listen for source actions from the client and emit it to
   * the Worker Reactable here
   */
  const sources$ = new ReplaySubject<Action<unknown>>(1);

  onmessage = (event: MessageEvent<ToWorkerMessage>) => {
    switch (event.data.type) {
      /**
       * Initialization
       */
      case ToWorkerMessageTypes.Init: {
        reactable = RxFactory({
          ...config,
          ...event.data.props,
          sources: [sources$.asObservable()],
        });

        const [state$, actions, actions$] = reactable;

        /**
         * Create an actions schema to broadcast to the client -
         * so they can create an ActionMap on their end.
         */
        const actionsSchema: ActionsSchema = {
          /**
           * Ensure a destroy action will be added so client can
           * invoke it to clean up subscriptions on teardown
           */
          destroy: null,
        };

        /* We will recursively loop through the ActionMap and assign all
         * leaves null so it can be serialized and sent to client.
         */
        const assignNull = (source: ActionMap, dest: ActionsSchema) => {
          for (const key in source) {
            if (typeof source[key] === 'object' && typeof source[key] !== 'function') {
              dest[key] = Object.keys(source[key]).reduce(
                (acc, key) => ({ ...acc, [key]: null }),
                {},
              );
              assignNull(source[key] as unknown as ActionMap, dest[key]);
            } else {
              dest[key] = null;
            }
          }
        };

        assignNull(actions as ActionMap, actionsSchema);

        postMessage({
          type: FromWorkerMessageTypes.Initialized,
          actionsSchema,
        });

        state$.pipe(takeUntil(destroy$)).subscribe((state) => {
          postMessage({
            type: FromWorkerMessageTypes.State,
            state,
          });
        });

        if (actions$) {
          actions$.pipe(takeUntil(destroy$)).subscribe(({ type, payload }) => {
            postMessage({
              type: FromWorkerMessageTypes.Action,
              action: { type, payload },
            });
          });
        }

        break;
      }
      /**
       * Handling Client Actions
       * - find the corresponding action and invoke it
       */
      case ToWorkerMessageTypes.Action: {
        const { type, payload } = event.data.action;
        const splitKey = type.split('~');

        let action: unknown = reactable[1];

        try {
          for (let i = 0; i < splitKey.length; i++) {
            action = action[splitKey[i]];
          }
        } catch {}

        /**
         * For all actions other than destroy, if we don't find the action
         * throw an error
         */
        if (!action && type !== 'destroy') {
          throw 'Action not found';
        }

        // If the action exists, invoke it
        if (action) {
          (action as (payload?: unknown) => void)(payload);
        }

        // If it is a destroy action clean up subscriptions
        if (type === 'destroy') {
          console.log('workerDestroyed in worker');
          destroy$.next();
          destroy$.complete();
        }
        break;
      }
      case ToWorkerMessageTypes.Source:
        sources$.next(event.data.action);
        break;
      default:
    }
  };
};
