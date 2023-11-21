# Hubfx Forms (WIP)

## Description

State management for building a comprehensive form library using [Hubfx Core](https://github.com/hub-fx/hub-fx/tree/main/packages/core).

## Architecture (WIP see https://github.com/hub-fx/hub-fx/issues/8)

The following diagram visualizes the architecture of [Hubfx Forms](https://github.com/hub-fx/hub-fx/tree/main/packages/forms) - a state management model for building reactive forms.

There are two sets of hub and stores. The first set is responsible for handling user input and updating the form.

The second set is responsible for reacting to the form change in the first store and asynchronous validation.

![Hubfx architecture](https://raw.githubusercontent.com/hub-fx/hub-fx/main/documentation/Slide10HubfxForms.jpg)
