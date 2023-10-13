import { BaseForm } from '../../Models/Controls';
import isEqual from 'lodash.isequal';

export const updateDirty = <T>(form: BaseForm<T>): BaseForm<T> =>
  Object.entries(form).reduce((acc, [key, control]) => {
    return {
      ...acc,
      [key]: {
        ...control,
        dirty: !isEqual(control.value, control.pristineValue),
      },
    };
  }, {} as BaseForm<T>);
