import {
  BaseArrayControl,
  BaseGroupControl,
  BaseAbstractControl,
} from '../../Models/Controls';
import { FormErrors } from '../../Models/FormErrors';
import cloneDeep from 'lodash.clonedeep';

export const syncValidate = <T>(
  control: BaseAbstractControl<T>,
): BaseAbstractControl<T> => {
  let newControl: BaseAbstractControl<T> = cloneDeep(control);

  let controlsHasErrors = false;

  if (Array.isArray((<BaseArrayControl<T>>newControl).controls)) {
    const controls = (<BaseArrayControl<T>>newControl).controls;
    newControl = {
      ...newControl,
      controls: controls.map((control) => syncValidate(control)),
    } as BaseArrayControl<T>;

    controlsHasErrors = (<BaseArrayControl<T>>newControl).controls.some(
      (control) => {
        if (control.validatorErrors) {
          return Object.values(control.validatorErrors).some((error) => error);
        }

        return false;
      },
    );
  } else if ((<BaseGroupControl<T>>newControl).controls) {
    const controls = (<BaseGroupControl<T>>control).controls;
    newControl = {
      ...newControl,
      controls: Object.entries(controls).reduce(
        (
          result: { [key: string]: BaseAbstractControl<unknown> },
          [key, control],
        ) => {
          result[key] = syncValidate(control);
          return result;
        },
        {},
      ),
    } as BaseGroupControl<T>;

    controlsHasErrors = Object.values(
      (<BaseGroupControl<T>>newControl).controls,
    ).some((control) => {
      if (control.validatorErrors) {
        return Object.values(control.validatorErrors).some((error) => error);
      }

      return false;
    });
  }

  const validators = control.config.validators;
  const validatorErrors =
    validators?.reduce((errors, validator) => {
      return {
        ...errors,
        ...validator(control.value),
      };
    }, {} as FormErrors) || {};

  const groupControlHasError = validatorErrors
    ? Object.values(validatorErrors).some((error) => error)
    : false;

  return {
    ...newControl,
    validatorErrors,
    validatorsValid: !groupControlHasError && !controlsHasErrors,
  };
};
