<a href="https://stackblitz.com/edit/github-qtpo1k-gvgbvy?file=src%2Findex.js" target="_blank" rel="noreferrer">
 <img src="/reactables/stackblitz.png" width="100" />
<a>

<br>
<br>

```typescript
import { RxToggle } from './RxToggle';

const [state$, actions] = RxToggle();
const { toggleOn, toggleOff, toggle } = actions;

state$.subscribe((toggleState) => {
  // Update the view when state changes.
  document.getElementById('toggle-state')
    .innerHTML = toggleState ? 'On' : 'Off';
});

// Bind click handlers
document.getElementById('toggle-on')
  .addEventListener('click', toggleOn);
document.getElementById('toggle-off')
  .addEventListener('click', toggleOff);
document.getElementById('toggle')
  .addEventListener('click', toggle);


```
