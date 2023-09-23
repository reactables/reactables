# Hubfx Core (WIP)

## Description

Reactive state management with RxJS.

## Table of Contents

1. [Installation](#installation)
1. [Core concepts](#core-concepts)
    1. [Hub and Stores](#hub-stores)
    1. [Effects](#effects)
       1. [Scoped Effects](#scoped-effects)
    1. [Integrating with UI](#integration)
    1. [Unidirectional Flow](#unidirectional-flow)
1. [API](#api)
    1. [Basic Usage](#api-usage)
    1. [Effect](#api-effect)
    1. [Action](#api-action)
    1. [Reducer](#api-reducer)
    1. [ScopedEffects](#api-scoped-effects)
    1. [HubFactory](#hub-factory)
        1. [HubConfig](#hub-config)
    1. [Hub](#hub)
        1. [Store Config](#store-config)

1. [Examples](#examples)
    1. [Angular Example](#hub-angular-example)
    1. [React Example](#hub-react-example)

## Installation <a name="installation"></a>

`npm i @hub-fx/core`

## Core concepts <a name="core-concepts"></a>

Taking inspiraton from [Redux](https://redux.js.org/introduction/core-concepts) and [NgRx](https://ngrx.io/guide/store), Hubfx uses the same concepts regarding Actions, Effects, Reducers, Store. These concepts are coupled with [RxJS](https://rxjs.dev/) observables to manage state modelled as reactive streams.

In this documentation the term *stream* will refer to an RxJS observable stream.

### Hub and Stores <a name="hub-stores"></a>

The **Hub** is responsible for dispatching actions to the store(s) registered to the hub. It is also responsible for handling side effects. The main stream that initiates all actions and effects is the `dispatcher$` 

<img src="https://github.com/hub-fx/hub-fx/blob/main/documentation/SlideOneHubStore.jpg?raw=true" width="600" />

### Effects<a name="effects"></a>

When initializing a hub we can declare effects. The hub can listen for various actions and perform side-effects as needed. Stores that are registered to the hub will be listening to these effects as well the `dispatcher$`.

<img src="https://github.com/hub-fx/hub-fx/blob/main/documentation/SlideTwoEffect.jpg?raw=true" width="600" />

**Scoped Effects** are dynamically created streams scoped to a particular action & key combination when an action is dispatch.<a name="scoped-effects"></a>

<img src="https://github.com/hub-fx/hub-fx/blob/main/documentation/SlideThreeScopedEffects.jpg?raw=true" width="600" />

### Integrating with UI <a name="integration"></a>
A network of hubs and stores can be integrated with UI components without tight coupling. Separating presentation concerns improves testability and allows developers to decide how to integrate with UI components.

<img src="https://github.com/hub-fx/hub-fx/blob/main/documentation/SlideFourFiveIntegration.jpg?raw=true" />

### Unidirectional Flow <a name="unidirectional-flow"></a>
All actions and data will flow through the App in one direction.

<img src="https://github.com/hub-fx/hub-fx/blob/main/documentation/SlideSevenEightUnidirectionalFlow.jpg?raw=true" />

## API <a name="api"></a>

### Basic Usage <a name="api-usage"></a>

```typescript
import { HubFactory } from '@hub-fx/core';

// Create a hub
const hub = HubFactory();

// Pure reducer function to handle state updates
const countReducer = (state = { counter: 0 }, action) => {
  switch (action.type) {
    case 'increment':
      return { counter: state.counter + 1 };
    default:
      return state;
  }
}

// Create a store listening to `hub`
const count$ = hub.store({ reducer: countReducer });

// Subscribe to store for updates
count$.subscribe((count) => console.log(count));

hub.dispatch({ type: 'increment' });

// Output
// 1
```
### Effect <a name="api-effect"></a>
```typescript
type Effect<T, S> = OperatorFunction<Action<T>, Action<S>>;
```
Effects are expressed as [RxJS Operator Functions](https://rxjs.dev/api/index/interface/OperatorFunction). They pipe the [dispatcher$](#hub-dispatcher) stream and run side effects on incoming [Actions](#api-action).

Example of an operator that filters for a particular [Action](#api-action) type.

```typescript
import { OperatorFunction } from 'rxjs';
import { filter } from 'rxjs/operators';
import { Action } from '../Models/Action';

export const ofType: (type: string) => OperatorFunction<Action, Action> =
  (type: string) => (dispatcher$) => {
    return dispatcher$.pipe(filter((action) => action?.type === type));
  };

```

### Action <a name="api-action"></a>
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

### ScopedEffects <a name="api-scoped-effects"></a>
```typescript
interface ScopedEffects<T> {
  key?: string;
  effects: Effect<T, unknown>[];
}
```
| Property | Description |
| -------- | ----------- |
| key (optional) | key to be combined with the Action `type` to generate a unique signature for the effect stream(s). Example: An id for the entity the action is being performed on. |
| effects | Array of [Effects](#api-effects) scoped to the Action `type` & `key` |

Scoped Effects are declared in [Actions](#api-action). They are dynamically created stream(s) scoped to an Action `type` & `key` combination.

Example:

```typescript

const UPDATE_TODO = 'UPDATE_TODO';
const UPDATE_TODO_SUCCESS = 'UPDATE_TODO_SUCCESS';
const updateTodo = ({ id, message }, todoService: TodoService) => ({
  type: UPDATE_TODO,
  payload: { id, message },
  scopedEffects: {
    key: id,
    effects: [
      (updateTodoActions$: Observable<Action<string>>) =>
        updateTodoActions$.pipe(
          mergeMap(({ payload: { id, message } }) => todoService.updateTodo(id, message))
          map(({ data }) => ({
            type: UPDATE_TODO_SUCCESS,
            payload: data
          }))
        )
    ]
  }
})
```

### Reducer <a name="api-reducer"></a>

```typescript
type Reducer<T> = (state?: T, action?: Action<unknown>) => T;
```
From [Redux Docs](https://redux.js.org/tutorials/fundamentals/part-3-state-actions-reducers)
> Reducers are functions that take the current state and an action as arguments, and return a new state result

### HubFactory <a name="hub-factory"></a>

Factory function for creating [Hubs](#hub)

```typescript
type HubFactory = (config?: HubConfig) => Hub;

```

#### HubConfig <a name="hub-config"></a>

```typescript
interface HubConfig {
  effects?: Effect<unknown, unknown>[];
  sources?: Observable<Action<unknown>>[]; // WIP not implemented yet
}
```
| Property | Description |
| -------- | ----------- |
| effects (optional) | Array of [Effects](#api-effects) to be registered to the Hub |
| sources (optional) | Additional [Action](#api-actions) Observables the Hub is listening to |



### Hub <a name="hub"></a>
```typescript
interface Hub {
  messages$: Observable<Action<unknown>>;
  store: <T>(config: StoreConfig<T>) => Observable<T>;
  dispatch: (...actions: Action<unknown>[]) => void;
}
```
| Property | Description |
| -------- | ----------- |
| messages$ | Observable of all [Actions](#api-actions) sent to store(s) listening to the hub |

| Method | Description |
| -------- | ----------- |
| store | creates a store that will receive actions emitted from the hub via `messages$`. Accepts an configuration object (see [StoreConfig](#store-config)) |
| dispatch | dispatches [Action(s)](#api-actions) to the store(s) and effects (if any) |

#### Store Config <a name="store-config"></a>

```typescript
export interface StoreConfig<T> {
  reducer: Reducer<T>;
  initialState?: T;
  name?: string;
  debug?: boolean;
}
```
| Property | Description |
| -------- | ----------- |
| reducer | [Reducer](#api-reducer) function handle state updates in store |
| intitialState (optional) | for seeding an initial state |
| name (optional) | name of stream to show up during debugging |
| debug (optional) | to turn on debugging to console.log all messages received by the store and state changes |

Debug Example:

<img src="https://github.com/hub-fx/hub-fx/blob/main/documentation/SlideSixDebug.jpg?raw=true" width="500" />

## Examples <a name="examples"></a>

### Angular Example <a name="hub-angular-example"></a>

Using our above count example we can integrate with an Angular component. 

```typescript
import { Component, Input, OnInit } from '@angular/core';
import { HubFactory } from '@hub-fx/core';
import { countReducer } from '/countReducer';

export class CounterComponent {
  @Input() hub = HubFactory();
  count$: Observable<number>;

  increment() {
    this.hub.dispatch({ type: 'increment' });
  }

  ngOnInit() {
    this.count$ = this.hub.store({ reducer: countReducer });
  }
}

```

### React Example <a name="hub-react-example"></a>

Using our above count example we can integrate with a React component. 

```typescript
import { useHub } from './useHub';
import { useObservable } from './useObservable';
import { countReducer } from './countReducer';

const Counter = (({ hub = useHub() })) => {

  const count = useObservable(hub.store(countReducer));

  return (
    <div>
      Count: {count}
      <button onClick={ () => {hub.dispatch({ type: 'increment' }); }}>
        Increment
      </button>
    </div>
  )
}


```

Hook to store a hub reference.

```typescript
// useHub.ts

import { useRef } from 'react';
import { HubFactory } from '@hub-fx/core';

export const useHub = () => {
  return useRef(HubFactory()).current;
};
```

Hook to bind observable to React state.

```typescript
// useObservable.ts

import { useEffect, useState, useRef } from 'react';
import { Observable } from 'rxjs';

export const useObservable = <T>(obs$: Observable<T>) => {
  const currentObs$ = useRef(obs$).current;
  const [state, setState] = useState<T | undefined>(undefined);

  useEffect(() => {
    const subscription = currentObs$.subscribe((result) => {
      setState(result);
    });

    const unsubscribe = subscription.unsubscribe.bind(
      subscription,
    ) as () => void;

    return unsubscribe;
  }, []);

  return state;
};
```
