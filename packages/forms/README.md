# Reactable Forms (WIP)

## Description

State management for building a comprehensive form library using [Reactables Core](https://github.com/reactables/reactables/tree/main/packages/core).

## Architecture (WIP see https://github.com/reactables/reactables/issues/8)

The following diagram visualizes the architecture of [Reactables Forms](https://github.com/reactables/reactables/tree/main/packages/forms) - a state management model for building reactive forms.

There are two sets of hub and stores. The first set is responsible for handling user input and updating the form.

The second set is responsible for reacting to the form change in the first store and asynchronous validation.

![Reactables architecture](https://raw.githubusercontent.com/reactables/reactables/main/documentation/Slide10ReactablesForms.jpg)
