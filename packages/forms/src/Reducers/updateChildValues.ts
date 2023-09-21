import cloneDeep from 'lodash.clonedeep';
import { FormArray, FormGroup, AbstractControl } from '../Models/Controls';
import { FormArrayConfig, FormGroupConfig } from '../Models';

export const updateChildValues = <T>(state: AbstractControl<T>) => {
  const newState: AbstractControl<T> = cloneDeep(state);
  const value = newState.value;
  const config = newState.config as FormArrayConfig | FormGroupConfig;
  const controls = config.controls;
  if (controls && !(controls instanceof Array)) {
    if (
      Object.keys(value).length !==
      Object.keys((<FormGroup<T>>newState).controls).length
    ) {
      throw `The number of keys do not match form group: ${newState.controlRef.join(
        ',',
      )}`;
    }
    Object.entries(value).forEach(([key, value]) => {
      if (!(<FormGroup<T>>newState).controls[key]) {
        throw `Cannot find control with key ${key} in form group: ${newState.controlRef.join(
          ',',
        )}`;
      }
      (<FormGroup<T>>newState).controls[key].value = value;
      (<FormGroup<T>>newState).controls[key] = updateChildValues(
        (<FormGroup<T>>newState).controls[key],
      );
    });
  } else if (controls && controls instanceof Array) {
    (<FormArray<T>>newState).controls.forEach((control, index) => {
      if (!Array.isArray(value)) {
        throw `value must be an array for form array: ${newState.controlRef.join(
          ',',
        )}`;
      }

      if (
        (<Array<unknown>>value).length !==
        (<FormArray<T>>newState).controls.length
      ) {
        throw `The number of value items does not match the number of controls in array: ${newState.controlRef.join(
          ',',
        )}`;
      }
      control.value = value[index];
      (<FormArray<T>>newState).controls[index] = updateChildValues(control);
    });
  }

  return newState;
};
