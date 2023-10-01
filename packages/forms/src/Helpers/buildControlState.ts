import {
  BaseArrayControl,
  BaseControl,
  BaseGroupControl,
} from '../Models/Controls';
import { ControlRef } from '../Models/ControlRef';
import { FormErrors } from '../Models/FormErrors';
import {
  FormControlConfig,
  FormArrayConfig,
  FormGroupConfig,
  AbstractControlConfig,
} from '../Models/Configs';
import cloneDeep from 'lodash.clonedeep';

import { getValueFromControlConfig } from '../Helpers/getValueFromControlConfig';

export const buildControlState = <T>(
  controlConfig: AbstractControlConfig,
  controlRef: ControlRef = [],
): BaseControl<unknown> => {
  // Form Group
  const controls = (<FormGroupConfig | FormArrayConfig>controlConfig).controls;
  if (controls && !(controls instanceof Array)) {
    const controls = {} as { [key: string]: BaseControl<unknown> };
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

    const validatorErrors =
      controlConfig.validators?.reduce((errors, validator) => {
        return {
          ...errors,
          ...validator(getValueFromControlConfig(controlConfig)),
        };
      }, {} as FormErrors) || {};

    const result: BaseGroupControl<T> = {
      controlRef,
      dirty: false,
      touched: false,
      value: groupInitialValue as T,
      controls,
      validatorErrors,
      config: controlConfig,
    };

    return { pristineControl: cloneDeep(result), ...result };
    // Form Array
  } else if (controls && controls instanceof Array) {
    const configControls = (<FormArrayConfig>controlConfig).controls;
    const controls: BaseControl<unknown>[] = configControls
      ? configControls.reduce(
          (acc: BaseControl<unknown>[], config, index) =>
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

    const value = controls.map(({ value }) => value) as T;

    const result: BaseArrayControl<T> = {
      controlRef,
      controls,
      dirty: false,
      value,
      touched: false,
      validatorErrors: errors,
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

    const result: BaseControl<T> = {
      controlRef,
      dirty: false,
      value: (<FormControlConfig<T>>controlConfig).initialValue,
      touched: false,
      validatorErrors: errors,
      config: controlConfig,
    };

    return { pristineControl: cloneDeep(result), ...result };
  }
};
