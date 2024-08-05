<a href="https://stackblitz.com/edit/vitejs-vite-fmst4h?file=src%2FMyForm.tsx" target="_blank" rel="noreferrer">
 <img src="/reactables/stackblitz.png" width="100" />
</a>

<br>
<br>

See <a href="/reactables/react/react-bindings">React Bindings</a> & <a href="/reactables/react/react-form-components">React Form Components</a> for API reference!

```typescript

import { build, group, control, array } from '@reactables/forms';
import { useReactable } from '@reactables/react-helpers';
import { Form, Field, FormArray } from '@reactables/react-forms';
import Input from './Input';
import { RxFormArray, userConfig } from './RxFormArray';

const MyForm = () => {
  const [state, actions] = useReactable(RxFormArray);

  if (!state) return <></>;

  return (
    <Form rxForm={[state, actions]}>
      <FormArray name="contacts">
        {({ items, pushControl, removeControl }) => {
          return (
            <>
              {items.map((control, index) => {
                return (
                  <div key={control.key}>
                    <div>Contact # {index + 1}</div>
                    <Field
                      name={`contacts.${index}.name`}
                      label="Name:"
                      component={Input}
                    />
                    <Field
                      name={`contacts.${index}.email`}
                      label="Email: "
                      component={Input}
                    />
                    <button type="button" onClick={() => removeControl(index)}>
                      Remove contact
                    </button>
                  </div>
                );
              })}
              <button type="button" onClick={() => pushControl(userConfig)}>
                Add Contact
              </button>
            </>
          );
        }}
      </FormArray>
    </Form>
  );
};

export default MyForm;

```