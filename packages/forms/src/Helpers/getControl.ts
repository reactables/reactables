import {
  FormControl,
  FormArray,
  FormGroup,
  AbstractControl,
} from '../Models/Controls';
import { ControlRef } from '../Models/ControlRef';

export const getControl = (
  controlRef: ControlRef,
  control: AbstractControl<unknown>,
): AbstractControl<unknown> => {
  if (!controlRef.length) {
    return control;
  }

  const result: FormControl<unknown> = controlRef.reduce(
    (acc, key): AbstractControl<unknown> => {
      if (typeof key === 'string') {
        return (<FormGroup<unknown>>acc).controls[key];
      }

      return (<FormArray<unknown>>acc).controls[key];
    },
    control,
  );

  return result;
};
