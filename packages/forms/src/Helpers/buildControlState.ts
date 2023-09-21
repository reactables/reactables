import {
  FormControl,
  FormGroup,
  FormArray,
  AbstractControl,
} from '../Models/Controls';
import { ControlRef } from '../Models/ControlRef';
import { FormErrors } from '../Models/FormErrors';
import {
  FormControlConfig,
  FormArrayConfig,
  FormGroupConfig,
  AbstractControlConfig,
} from '../Models/Configs';

import { getValueFromControlConfig } from './getValueFromControlConfig';
import cloneDeep from 'lodash.clonedeep';

export const buildControlState = <T>(
  controlConfig: AbstractControlConfig,
  controlRef: ControlRef = [],
): AbstractControl<T> => {
  // Form Group
  const controls = (<FormGroupConfig | FormArrayConfig>controlConfig).controls;
  if (controls && !(controls instanceof Array)) {
    const controls = {} as { [key: string]: FormControl<unknown> };
    const groupInitialValue: {
      [key: string]: unknown;
    } = getValueFromControlConfig(controlConfig);

    for (const key in (<FormGroupConfig>controlConfig).controls) {
      const formGroupControlConfig = (<FormGroupConfig>controlConfig).controls[
        key
      ];
      controls[key] = buildControlState(
        formGroupControlConfig,
        controlRef.concat(key),
      );
    }

    const errors =
      controlConfig.validators?.reduce((errors, validator) => {
        return {
          ...errors,
          ...validator(getValueFromControlConfig(controlConfig)),
        };
      }, {} as FormErrors) || {};

    const groupControlHasError = errors
      ? Object.values(errors).some((error) => error)
      : false;

    const controlsHasErrors = Object.values(controls).some((control) => {
      if (control.errors) {
        return Object.values(control.errors).some((error) => error);
      }

      return false;
    });

    const result: FormGroup<T> = {
      controlRef,
      dirty: false,
      touched: false,
      value: groupInitialValue as T,
      valid: !groupControlHasError && !controlsHasErrors,
      submitting: false,
      asyncValidateInProgress: {},
      pending: false,
      controls,
      errors,
      config: controlConfig,
    };

    return { pristineControl: cloneDeep(result), ...result };
    // Form Array
  } else if (controls && controls instanceof Array) {
    const configControls = (<FormArrayConfig>controlConfig).controls;
    const controls: AbstractControl<unknown>[] = configControls
      ? configControls.reduce(
          (acc: AbstractControl<unknown>[], config, index) =>
            (acc = acc.concat(
              buildControlState(config, controlRef.concat(index)),
            )),
          [],
        )
      : [];

    const errors =
      controlConfig.validators?.reduce((errors, validator) => {
        return {
          ...errors,
          ...validator(getValueFromControlConfig(controlConfig)),
        };
      }, {} as FormErrors) || {};

    const arrayControlHasError = errors
      ? Object.values(errors).some((error) => error)
      : false;

    const controlsHasErrors = controls.some((control) => {
      if (control.errors) {
        return Object.values(control.errors).some((error) => error);
      }

      return false;
    });

    const value = controls.map(({ value }) => value) as T;

    const result: FormArray<T> = {
      controlRef,
      controls,
      dirty: false,
      value,
      touched: false,
      asyncValidateInProgress: {},
      pending: false,
      valid: !arrayControlHasError && !controlsHasErrors,
      errors,
      config: controlConfig,
    };

    return { pristineControl: cloneDeep(result), ...result };
    // Form Field
  } else {
    const errors =
      controlConfig.validators?.reduce((errors, validator) => {
        return {
          ...errors,
          ...validator(getValueFromControlConfig(controlConfig)),
        };
      }, {} as FormErrors) || {};

    const result: FormControl<T> = {
      controlRef,
      dirty: false,
      value: (<FormControlConfig<T>>controlConfig).initialValue,
      touched: false,
      valid: errors ? Object.values(errors).every((error) => !error) : true,
      asyncValidateInProgress: {},
      pending: false,
      errors,
      config: controlConfig,
    };

    return { pristineControl: cloneDeep(result), ...result };
  }
};
