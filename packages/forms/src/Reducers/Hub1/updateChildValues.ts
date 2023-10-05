import cloneDeep from 'lodash.clonedeep';
import {
  BaseArrayControl,
  BaseGroupControl,
  BaseControl,
} from '../../Models/Controls';
import { FormArrayConfig, FormGroupConfig } from '../../Models';

export const updateChildValues = <T>(state: BaseControl<T>) => {
  const newState: BaseControl<T> = cloneDeep(state);
  const value = newState.value;
  const config = newState.config as FormArrayConfig | FormGroupConfig;
  const controls = config.controls;
  if (controls && !(controls instanceof Array)) {
    if (
      Object.keys(value).length !==
      Object.keys((<BaseGroupControl<T>>newState).controls).length
    ) {
      throw `The number of keys do not match form group: ${newState.controlRef.join(
        ',',
      )}`;
    }
    Object.entries(value).forEach(([key, value]) => {
      if (!(<BaseGroupControl<T>>newState).controls[key]) {
        throw `Cannot find control with key ${key} in form group: ${newState.controlRef.join(
          ',',
        )}`;
      }
      (<BaseGroupControl<T>>newState).controls[key].value = value;
      (<BaseGroupControl<T>>newState).controls[key] = updateChildValues(
        (<BaseGroupControl<T>>newState).controls[key],
      );
    });
  } else if (controls && controls instanceof Array) {
    (<BaseArrayControl<T>>newState).controls.forEach((control, index) => {
      if (!Array.isArray(value)) {
        throw `value must be an array for form array: ${newState.controlRef.join(
          ',',
        )}`;
      }

      if (
        (<Array<unknown>>value).length !==
        (<BaseArrayControl<T>>newState).controls.length
      ) {
        throw `The number of value items does not match the number of controls in array: ${newState.controlRef.join(
          ',',
        )}`;
      }
      control.value = value[index];
      (<BaseArrayControl<T>>newState).controls[index] =
        updateChildValues(control);
    });
  }

  return newState;
};
