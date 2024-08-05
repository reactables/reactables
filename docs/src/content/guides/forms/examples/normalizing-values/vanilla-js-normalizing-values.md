<a href="https://stackblitz.com/edit/github-qtpo1k-frpncu?file=src%2Findex.js" target="_blank" rel="noreferrer">
 <img src="/stackblitz.png" width="100" />
<a>

<br>
<br>

```typescript

const rxForm = RxFormNormalizing();

const [state$, actions] = rxForm;

// Cache the DOM
const phoneControlEl = document.getElementById('phone-control');
const phoneRequiredErrorEl = document.getElementById('phone-required-error');

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
phoneControlEl.oninput = onInput(['phone']);
phoneControlEl.onblur = onBlur(['phone']);

// Subscribe to state updates and bind to view.
state$.subscribe((state) => {
  const { phone } = state;

  phoneControlEl.value = phone.value;

  const handleErrors = (el, show) => {
    el.className = show ? 'form-error show' : 'form-error';
  };
  handleErrors(phoneRequiredErrorEl, phone.touched && phone.errors.required);
});
```