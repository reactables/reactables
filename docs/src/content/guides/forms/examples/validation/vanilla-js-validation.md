<a href="https://stackblitz.com/edit/github-qtpo1k-f6tz82?file=src%2Findex.js" target="_blank" rel="noreferrer">
 See full example on <img src="/stackblitz.png" width="100" />
<a>

<br>
<br>

```typescript
import { RxFormValidation } from './RxFormValidation';

const [state$, actions] = RxFormValidation();

// ...Cache the DOM and bind event handlers

// Subscribe to state updates and bind to view.
state$.subscribe((state) => {
  const { donuts } = state;

  donutControlEl.value = donuts.value;

  const handleErrors = (el, show) => {
    el.className = show ? 'form-error show' : 'form-error';
  };

  handleErrors(donuntMinOrderErrorEl, donuts.touched && donuts.errors.min4);
  handleErrors(donuntRequiredErrorEl, donuts.touched && donuts.errors.required);
});

```