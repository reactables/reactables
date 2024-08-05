<a href="https://stackblitz.com/edit/github-qtpo1k-vm45ed?file=src%2Findex.js" target="_blank" rel="noreferrer">
 <img src="/stackblitz.png" width="100" />
<a>

<br>
<br>

```typescript
import { RxBasicFormGroup } from './RxBasicFormGroup';

const [state$, actions] = RxBasicFormGroup();

// Cache the DOM
const nameControlEl = document.getElementById('name-control');

// Bind Event Handlers
nameControlEl.oninput = ({ target: { value } }) => {
  actions.updateValues({
    controlRef: ['name'],
    value,
  });
};

nameControlEl.onblur = () => {
  actions.markControlAsTouched({ controlRef: ['name'] });
};

// Subscribe to state updates and bind to view.
state$.subscribe((state) => {
  const { name } = state;

  nameControlEl.value = name.value;
});

```