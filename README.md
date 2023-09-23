# Hubfx

## Description

Reactive state management with RxJS.

## Installation

`npm i @hub-fx/core`

## Motivation

### Decoupling state management from UI components for:

1. Improved testability

    - UI components can be very complex, engaged in state management and asynchronous side-effects. Because this logic is tightly coupled with components - isolating smaller units for testing is often difficult because components as a whole needs to be rendered for testing.

    - From [React Docs](https://legacy.reactjs.org/docs/testing.html)

      > With components, the distinction between a “unit” and “integration” test can be blurry. If you’re testing a form, should its test also test the buttons inside of it? Or should a button component have its own test suite? Should refactoring a button ever break the form test?
    
    - With Hubfx developers can develop and test their state logic independently without rendering any UI providing greater flexibility and speed in unit testing. 

1. Reusability and Framework agnostic

    - Hubfx pattern is highly composable, reusable and can easily integrate with any JS framework/library or vanilla JS.

### Consistent pattern and api in managing both Application (Global) State and Local Component State

Developers can follow a standardized reactive pattern in managing state in any UI Framework. 


### Better handling of side effects 

Unidirectional flow of actions 

[See Core Package README.md](./packages/core/README.md)
