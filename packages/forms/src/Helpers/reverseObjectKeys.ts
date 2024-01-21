import { Form } from '../Models/Controls';
export const reverseObjectKeys = <T>(form: Form<T>) =>
  Object.keys(form)
    .reverse()
    .reduce((acc, key) => {
      acc[key] = form[key];
      return acc;
    }, {}) as Form<T>;
