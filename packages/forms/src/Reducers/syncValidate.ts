import { FormArray, FormGroup, AbstractControl } from '../Models/Controls';
import { FormErrors } from '../Models/FormErrors';
import cloneDeep from 'lodash.clonedeep';

export const syncValidate = <T>(
  control: AbstractControl<T>,
): AbstractControl<T> => {
  let newControl: AbstractControl<T> = cloneDeep(control);

  let controlsHasErrors = false;

  if (Array.isArray((<FormArray<T>>newControl).controls)) {
    const controls = (<FormArray<T>>newControl).controls;
    newControl = {
      ...newControl,
      controls: controls.map((control) => syncValidate(control)),
    } as FormArray<T>;

    controlsHasErrors = (<FormArray<T>>newControl).controls.some((control) => {
      if (control.errors) {
        return Object.values(control.errors).some((error) => error);
      }

      return false;
    });
  } else if ((<FormGroup<T>>newControl).controls) {
    const controls = (<FormGroup<T>>control).controls;
    newControl = {
      ...newControl,
      controls: Object.entries(controls).reduce(
        (
          result: { [key: string]: AbstractControl<unknown> },
          [key, control],
        ) => {
          result[key] = syncValidate(control);
          return result;
        },
        {},
      ),
    } as FormGroup<T>;

    controlsHasErrors = Object.values((<FormGroup<T>>newControl).controls).some(
      (control) => {
        if (control.errors) {
          return Object.values(control.errors).some((error) => error);
        }

        return false;
      },
    );
  }

  const validators = control.config.validators;
  const syncErrors =
    validators?.reduce((errors, validator) => {
      return {
        ...errors,
        ...validator(control.value),
      };
    }, {} as FormErrors) || {};

  const errors = {
    ...newControl.errors,
    ...syncErrors,
  };

  const groupControlHasError = errors
    ? Object.values(errors).some((error) => error)
    : false;

  return {
    ...newControl,
    errors,
    valid: !groupControlHasError && !controlsHasErrors,
  };
};
