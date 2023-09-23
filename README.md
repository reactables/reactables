# Hubfx (WIP)

## Description

Reactive state management with RxJS.

## Packages

[Hubfx Core](https://github.com/hub-fx/hub-fx/tree/main/packages/core) 

- Core `Hub` used to model state as reactive streams.

- `npm i @hub-fx/core`

[Hubfx React Forms](https://github.com/hub-fx/hub-fx/tree/main/packages/react-forms)

- See Storybook Demo [here](https://hub-fx.github.io/hub-fx/)

- React Form Library built on [Hubfx Forms](https://github.com/hub-fx/hub-fx/tree/main/packages/forms)

- `npm i @hub-fx/react-forms`

[Hubfx Forms](https://github.com/hub-fx/hub-fx/tree/main/packages/forms)

- Actions & Reducers for building a comprehensive form library using [Hubfx Core](https://github.com/hub-fx/hub-fx/tree/main/packages/core)

- `npm i @hub-fx/forms`

## Motivation

### Consistent management of Application (Global) State and Component (Local) State.

Developers can follow a standardized reactive pattern for managing state in any UI Framework for greater consistency.  

<img src="https://github.com/hub-fx/hub-fx/blob/main/documentation/SlideNineStandardPattern.jpg?raw=true" height="300" />

### Decoupling state management from UI components for:

1. Improved testability

    - UI components can be very complex, engaged in state management and asynchronous side-effects. Isolating units of logic for testing is often difficult because components as a whole need to be rendered for testing.

    - From [React Docs](https://legacy.reactjs.org/docs/testing.html)

      > With components, the distinction between a “unit” and “integration” test can be blurry. If you’re testing a form, should its test also test the buttons inside of it? Or should a button component have its own test suite? Should refactoring a button ever break the form test?
    
    - With Hubfx developers can develop and test their state logic independently without rendering any UI providing greater flexibility and speed in unit testing. 

    - `@hubfx/forms` is an example where all the state logic was built and tested independently. It was then integrated with React in `@hubfx/react-forms`

1. Reusability and Framework agnostic

    - Hubfx pattern is highly composable, reusable and can easily integrate with any UI framework/library or vanilla JS.

### Predictable State Updates 

All Hubfx Actions flow in one direction contained in streams, making state updates highly predictable and traceable in debugging.

<img src="https://github.com/hub-fx/hub-fx/blob/main/documentation/SlideThreeScopedEffects.jpg?raw=true" width="600" />
