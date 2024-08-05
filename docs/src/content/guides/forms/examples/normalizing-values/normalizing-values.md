## Normalizing Values
User input for a `FormControl` leaf (i.e having no child controls) can be normalized via normalizer functions provided during form initialization.

<a class="mb-3 d-block" href="https://github.com/reactables/reactables/edit/main/docs/src/content/guides/forms/examples/normalizing-values/normalizing-values.md" target="_blank" rel="noreferrer">
  Edit this snippet <i class="fa fa-edit"></i>
</a>

```typescript
import { control, build, group } from '@reactables/forms';

const normalizePhone = (value) => {
  let input = value.replace(/\D/g, '').substring(0, 10); // First ten digits of input only
  const areaCode = input.substring(0, 3);
  const middle = input.substring(3, 6);
  const last = input.substring(6, 10);

  if (input.length > 6) {
    input = `(${areaCode}) ${middle} - ${last}`;
  } else if (input.length > 3) {
    input = `(${areaCode}) ${middle}`;
  } else if (input.length > 0) {
    input = `(${areaCode}`;
  }

  return input;
};

export const RxFormNormalizing = () => build(
  group({
    controls: {
      phone: control({
        initialValue: '',
        normalizers: ['phone']
      }),
    },
  }),
  {
    providers: {
      normalizers: {
        phone: normalizePhone,
      },
    },
  }
);

```