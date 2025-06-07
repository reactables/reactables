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
- EffectsAndSources Interface removed
- Effects option removed
- effects and sources interface removed
- all reactables now store their state and has a destroy action
- storeValue removed
- sources now is only array signature, no dictionary

### React
- Store Provider & useAppStore removed from library

### Forms
- valid state is now longer coupled with pending
- control only goes into pending when async validation is actually in progress (observable sent)