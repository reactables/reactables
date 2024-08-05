<a href="https://stackblitz.com/edit/github-qtpo1k-3qppus?file=src%2Findex.js" target="_blank" rel="noreferrer">
 <img src="/stackblitz.png" width="100" />
<a>

<br>
<br>

```typescript

const [state$, actions] = RxCustomReducers();

// Cache the DOM
const donutControlEl = document.getElementById('donut-control');
const donuntMinOrderErrorEl = document.getElementById('donut-min-order-error');

const doubleOrderBtnEl = document.getElementById('double-order-btn');

// Event Handlers
const onInput =
  (controlRef) =>
  ({ target: { value } }) => {
    actions.updateValues({
      controlRef,
      value,
    });
  };

const onBlur = (controlRef) => () => {
  actions.markControlAsTouched({ controlRef });
};

// Bind Event Handlers
doubleOrderBtnEl.onclick = actions.doubleOrder;
donutControlEl.oninput = onInput(['donuts']);
donutControlEl.onblur = onBlur(['donuts']);

// Subscribe to state updates and bind to view.
state$.subscribe((state) => {
  const { donuts } = state;

  donutControlEl.value = donuts.value;

  const handleErrors = (el, show) => {
    el.className = show ? 'form-error show' : 'form-error';
  };

  handleErrors(donuntMinOrderErrorEl, donuts.touched && donuts.errors.min4);
});
```