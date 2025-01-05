# Reactables Core API

## `Reactable` <a name="reactable"></a>

Reactables provide the API for applications and UI components to receive and trigger state updates.

It is a tuple with the first item being an Observable emitting state changes and the second item is a dictionary of action methods for triggering state updates. 

Reactables may also expose an optional third item - an observable emitting all the actions the received by the store during state updates. This can be helpful if other reactables also want to subscribe and react to any of those actions.

```typescript
export type Reactable<T, S = ActionMap> = [Observable<T>, S, Observable<Action<unknown>>?];

export interface ActionMap {
  [key: string | number]: (payload?: unknown) => void | ActionMap;
}
```

## `RxBuilder` <a name="rx-builder"></a>

Factory function for building a [reactable primitive](/reactables/getting-started/core-concepts#reactable-primitive). Accepts a [RxConfig](#rx-config) configuration object.

```typescript
declare const RxBuilder: <T, S extends Cases<T>>(config: RxConfig<T, S>) => Reactable<T, { [K in keyof S]: (payload?: unknown) => void; }>;

```

### `RxConfig` <a name="rx-config"></a>

Configuration object for creating Reactables.

```typescript
interface RxConfig <T, S extends Cases<T>>{
  initialState: T;
  reducers: S;
  debug?: boolean;
  effects?: Effect<unknown, unknown>[];
  sources?: Observable<Action<unknown>>[] | { [key: string]: Observable<unknown> };
}

interface Cases<T> {
  [key: string]:
    | SingleActionReducer<T, unknown>
    | {
        reducer: SingleActionReducer<T, unknown>;
        effects?: Effect<unknown, unknown>[] | ((payload?: unknown) => ScopedEffects<unknown>);
      };
}

type SingleActionReducer<T, S> = (state: T, action: Action<S>) => T;
```
| Property | Description |
| -------- | ----------- |
| initialState | Initial state of the Reactable |
| reducers | Dictionary of cases for the Reactable to handle. Each case can be a reducer function or a configuration object. RxBuilder will use this to generate Actions, Reducers, and add [`ScopedEffects`](#api-scoped-effects). |
| debug (optional) | to turn on debugging to console.log all messages received by the store and state changes |
| effects (optional) | Array of [`Effects`](#api-effect) to be registered to the Reactable |
| sources (optional) <a name="hub-sources"></a> | Additional [`Action`](#api-action) Observables the Reactable is listening to. Can be an array or a dictionary where key is the action type and value is the Observable emitting the payload |

## `combine` <a name="combine"></a>
Helper function that accepts a dictionary of Reactables and combines them into one Reactable.

```typescript
export declare const combine: <T extends Record<string, Reactable<unknown, unknown>>>(sourceReactables: T) =>
  Reactable<
    { [K in keyof T]: ObservedValueOf<T[K][0]>; }, // Combined State
    { [K in keyof T]: T[K][1] }, // Combined ActionMap
    Observable<Action<unknown>>, // Merged Actions Observable
  >;
```

## `ofTypes` <a name="of-types"></a>

Function that accepts an array of action types (`string`) and returns an <a href="https://rxjs.dev/api/index/interface/OperatorFunction" target="_blank" rel="noreferrer">`OperatorFunction`</a> that will filter for those [`Action`](#api-action)s.

```typescript
export declare const ofTypes: (types: string[]) => OperatorFunction<Action<unknown>, Action<unknown>>;
```

## `storeValue` <a name="store-value"></a>

Decorator function used store the state value in a <a href="https://rxjs.dev/api/index/class/ReplaySubject" target="_blank" rel="noreferrer">`ReplaySubject`</a> instead of an <a href="https://rxjs.dev/api/index/class/Observable" target="_blank" rel="noreferrer">`Observable`</a> so subsequent subscriptions can access the latest stored value.

Also add's a `destroy` action method to be called to teardown any Reactable decorated with `storeValue`.

```typescript
interface DestroyAction {
  destroy: () => void;
}

declare const storeValue: <T, S>(reactable: Reactable<T, S>) => Reactable<T, S & DestroyAction>;
```

## Other Interfaces <a name="interfaces"></a>

### `Effect` <a name="api-effect"></a>

Effects are expressed as <a href="https://rxjs.dev/api/index/interface/OperatorFunction">RxJS Operator Functions</a>. They pipe the `dispatcher$` stream and run side effects on incoming [`Actions`](#api-action).

```typescript
type Effect<T, S> = OperatorFunction<Action<T>, Action<S>>;
```

### `ScopedEffects` <a name="api-scoped-effects"></a>

Scoped Effects are declared when defining reducers in [RxConfig](#rx-config). They are dynamically created stream(s) scoped to an Action `type` & `key` combination.

```typescript
interface ScopedEffects<T> {
  key?: string;
  effects: Effect<T, unknown>[];
}
```
| Property | Description |
| -------- | ----------- |
| key (optional) | key to be combined with the Action `type` to generate a unique signature for the effect stream(s). Example: An id for the entity the action is being performed on. |
| effects | Array of [`Effects`](#api-effect) scoped to the Action `type` & `key` |


### `Action` <a name="api-action"></a>
```typescript
interface Action<T = undefined> {
  type: string;
  payload?: T;
  scopedEffects?: ScopedEffects<T>;
}
```
| Property | Description |
| -------- | ----------- |
| type | type of Action being dispatched |
| payload (optional) | payload associated with Action |
| scopedEffects (optional) | [See ScopedEffects](#api-scoped-effects) |

### `Reducer` <a name="api-reducer"></a>

From the <a href="https://redux.js.org/tutorials/fundamentals/part-3-state-actions-reducers" target="_blank" rel="noreferrer">Redux Docs</a>:
> Reducers are functions that take the current state and an action as arguments, and return a new state result

```typescript
type Reducer<T> = (state?: T, action?: Action<unknown>) => T;
```
