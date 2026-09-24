import { Observable } from 'rxjs';
import { useEffect, useState, useRef, MutableRefObject } from 'react';
import { Reactable, ActionObservableWithTypes, DestroyAction } from '@reactables/core';

// Maps each leaf of a selector map from `(...args) => Observable<R>` to `(...args) => R`.
// Recursively handles nested objects produced by combine().
export type HookedSelect<Sel> = {
  [K in keyof Sel]: Sel[K] extends (...args: infer Args) => Observable<infer R>
    ? (...args: Args) => R
    : HookedSelect<Sel[K]>;
};

export type HookedReactable<T> = T extends (
  ...args: any[]
) => Reactable<infer S, infer U, infer V, infer M>
  ? [S, U, Observable<S>, ActionObservableWithTypes<V, M>] &
      (T extends (...args: any[]) => { select: infer Sel }
        ? { select: HookedSelect<Sel> }
        : unknown)
  : never;

// Reads the latest value from a shareReplay(1) observable synchronously.
function readLatest<R>(obs: Observable<R>): R {
  let value: R;
  const sub = obs.subscribe((v) => {
    value = v;
  });
  sub.unsubscribe();
  return value!;
}

function buildHookedSelect(sel: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const key of Object.keys(sel)) {
    const val = sel[key];
    if (typeof val === 'function') {
      result[key] = (...args: unknown[]) =>
        readLatest((val as (...args: unknown[]) => Observable<unknown>)(...args));
    } else if (val !== null && typeof val === 'object') {
      result[key] = buildHookedSelect(val as Record<string, unknown>);
    }
  }
  return result;
}

export const useReactable = <
  T,
  S extends DestroyAction,
  U extends unknown[],
  V extends Record<string, string>,
  M extends Record<string, unknown> = Record<string, unknown>,
>(
  reactableFactory: (...props: U) => Reactable<T, S, V, M>,
  ...props: U
): HookedReactable<typeof reactableFactory> => {
  const rx = useRef<Reactable<T, S, V, M>>(null) as MutableRefObject<Reactable<T, S, V, M>>;
  const hookedSelect = useRef<Record<string, unknown> | null>(null);
  const lastMount = useRef<Date>(null) as MutableRefObject<Date>;

  /**
   * React Strict Mode has bugs with clean up with refs so it breaks the useReactable hook as of now
   * See Bug: https://github.com/facebook/react/issues/26315
   * See Bug: https://github.com/facebook/react/issues/24670
   * Using this recommended approach for resolving Strict Modeissue: https://react.dev/reference/react/useRef#avoiding-recreating-the-ref-contents
   */
  if (rx.current === null) {
    rx.current = reactableFactory(...props);
    const sel = (rx.current as any).select;
    if (sel) {
      hookedSelect.current = buildHookedSelect(sel);
    }
  }

  const [state$, actions, actions$] = rx.current;
  const [state, setState] = useState<T>();

  useEffect(() => {
    lastMount.current = new Date();
    const subscription = state$.subscribe((result) => {
      setState(result);
    });

    return () => {
      subscription.unsubscribe();

      const diff = new Date().getTime() - lastMount.current.getTime();
      if (diff > 50) {
        actions.destroy?.();
      }
    };
  }, [actions, state$]);

  const tuple = [state, actions, state$, actions$];
  if (hookedSelect.current) {
    (tuple as any).select = hookedSelect.current;
  }
  return tuple as unknown as HookedReactable<typeof reactableFactory>;
};
