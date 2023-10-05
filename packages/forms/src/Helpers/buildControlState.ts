import cloneDeep from 'lodash.clonedeep';
import {
  BaseArrayControl,
  BaseControl,
  BaseGroupControl,
  BaseAbstractControl,
} from '../Models/Controls';
import { ControlRef } from '../Models/ControlRef';
import {
  FormControlConfig,
  FormArrayConfig,
  FormGroupConfig,
  AbstractControlConfig,
} from '../Models/Configs';
import { syncValidate } from '../Reducers/Hub1/syncValidate';

import { getValueFromControlConfig } from '../Helpers/getValueFromControlConfig';

export const buildControlState = <T>(
  controlConfig: AbstractControlConfig,
  controlRef: ControlRef = [],
): BaseAbstractControl<unknown> => {
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

    const result: BaseGroupControl<T> = syncValidate({
      controlRef,
      dirty: false,
      touched: false,
      value: groupInitialValue as T,
      controls,
      validatorErrors: {},
      validatorsValid: true,
      config: controlConfig,
    }) as BaseGroupControl<T>;

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

    const value = controls.map(({ value }) => value) as T;

    const result: BaseArrayControl<T> = syncValidate({
      controlRef,
      controls,
      dirty: false,
      value,
      touched: false,
      validatorErrors: {},
      validatorsValid: true,
      config: controlConfig,
    }) as BaseArrayControl<T>;

    return { pristineControl: cloneDeep(result), ...result };
    // Form Field
  } else {
    const result: BaseControl<T> = syncValidate({
      controlRef,
      dirty: false,
      value: (<FormControlConfig<T>>controlConfig).initialValue,
      touched: false,
      validatorErrors: {},
      validatorsValid: true,
      config: controlConfig,
    }) as BaseControl<T>;

    return { pristineControl: cloneDeep(result), ...result };
  }
};
