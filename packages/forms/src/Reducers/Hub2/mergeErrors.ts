import { AbstractControl, FormArray, FormGroup } from '../../Models/Controls';
import { FormErrors } from '../../Models';
const hasErrors = (errors: FormErrors) => {
  return Object.entries(errors).some(([_, hasError]) => hasError);
};
export const mergeErrors = <T extends AbstractControl<unknown>>(
  control: T,
): T => {
  const errors = {
    ...control.validatorErrors,
    ...control.asyncValidatorErrors,
  };
  const newControl: T = {
    ...control,
    errors,
  };
  if (Array.isArray((<FormArray<T>>newControl).controls)) {
    // If FormArray
    const formArray = <FormArray<T>>newControl;
    formArray.controls = formArray.controls.map(mergeErrors);
    formArray.valid = !(
      hasErrors(formArray.errors) ||
      formArray.controls.some((control) => hasErrors(control.errors))
    );
    return formArray as T;
  } else if ((<FormGroup<T>>control).controls) {
    // If FormGroup
    const formGroup = <FormGroup<T>>control;

    formGroup.controls = Object.entries(formGroup.controls).reduce(
      (acc, [key, control]) => {
        acc[key] = mergeErrors(control);
        return acc;
      },
      {},
    );

    formGroup.valid = !(
      hasErrors(formGroup.errors) ||
      Object.values(formGroup.controls).some((control) => control.valid)
    );

    return formGroup as T;
  }

  // If FormControl

  newControl.valid = !hasErrors(newControl.errors);

  return newControl;
};
