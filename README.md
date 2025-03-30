# <img src="https://avatars.githubusercontent.com/u/145691934" width="50"> Reactables

## Description

A reactive, flexible and extensible state management solution.

## Mission
Provide a simple, scalable and framework-agnostic state management that improves the UI development experience for all.

[See docs at https://reactables.github.io/reactables/](https://reactables.github.io/reactables/)

### Contact

Dave Lai
email: <a href="dlai@dave-lai.com">dlai@dave-lai.com</a>
<br>
<br>
Github: https://github.com/laidav

## v2 breaking changes

### Core
- Effects option removed
- effects and sources interface removed
- sources now is only array signature, no dictionary
- all reactables now store their state and has a destroy action

### Forms
- valid state is now longer coupled with pending