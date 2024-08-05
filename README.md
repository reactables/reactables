# <img src="https://avatars.githubusercontent.com/u/145691934" width="50"> Reactables

## Description

A reactive, flexible and extensible state management solution.

## Mission
Provide a simple, scalable and framework-agnostic state management that improves the UI development experience for all.

## Motivation

### Consistent management of Application (Global) State and Component (Local) State.

Developers can follow a standardized reactive pattern for managing state in any UI Framework for greater consistency.  

<img src="https://github.com/reactables/reactables/blob/main/assets/docs/SlideNineStandardPattern.jpg?raw=true" height="300" />

### Separation of Concerns - state management from UI components for:

1. Faster development

    - Presentation concerns from UI Components and State Logic are decoupled - more team members can implement and test each aspect independently without creating conflicts.

1. Improved Testability

    - UI components can be very complex, engaged in state management and asynchronous side-effects. Isolating units of logic for testing is often difficult because components as a whole need to be rendered for testing.

    - From [React Docs](https://legacy.reactjs.org/docs/testing.html)

      > With components, the distinction between a “unit” and “integration” test can be blurry. If you’re testing a form, should its test also test the buttons inside of it? Or should a button component have its own test suite? Should refactoring a button ever break the form test?
    
    - With Reactables, developers can write and test their state logic independently without rendering any UI providing greater flexibility and speed in unit testing.

1. Reusability and Framework agnostic

    - Reactables can easily integrate with any UI framework/library or vanilla JS making them highly reusuable.

### Scalability

Reactables can start small, then later combine with others to make larger and more complex ones. This makes them highly scalable.

### Predictable State Updates 

All Reactables Actions flow in one direction contained in streams, making state updates highly predictable and traceable in debugging.

<img src="https://github.com/reactables/reactables/blob/main/assets/docs/SlideThreeScopedEffects.jpg?raw=true" width="600" />

### Learn more! -> [See the docs](https://github.com/reactables/reactables/tree/main/packages/core) 

## Packages

[`@reactables/core`](https://github.com/reactables/reactables/tree/main/packages/core) 

- Core API for building reactables.

- `npm i @reactables/core`

[`@reactables/forms`](https://github.com/reactables/reactables/tree/main/packages/forms)

- Library for building reactive forms with reactables.

- `npm i @reactables/forms`

[`@reactables/react`](https://github.com/reactables/reactables/tree/main/packages/react)

- Reactable bindings for React Components

- `npm i @reactables/react`

[`@reactables/react-forms`](https://github.com/reactables/reactables/tree/main/packages/react-forms)

- React Form Library built on reactables created from [@reactables/forms](https://github.com/reactables/reactables/tree/main/packages/forms)

- `npm i @reactables/react-forms`
