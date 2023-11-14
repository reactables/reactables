import { AbstractControlConfig } from '../Models';
import { BaseForm, BaseControl } from '../Models/Controls';
import { ControlRef } from '../Models';
import { FormArrayConfig, FormGroupConfig } from '../Models';
import { getValueFromControlConfig } from './getValueFromControlConfig';
import { getFormKey } from './getFormKey';
import { generateKey } from './generateKey';

export const buildFormState = <T>(
  config: AbstractControlConfig,
  form: BaseForm<T> = { root: null },
  controlRef: ControlRef = [],
): BaseForm<T> => {
  const value = getValueFromControlConfig(config);
  const control: BaseControl<unknown> = {
    pristineValue: value,
    dirty: false,
    touched: false,
    value,
    controlRef,
    validatorErrors: {},
    validatorsValid: null,
    config,
    key: generateKey(5),
  };

  let newForm: BaseForm<T> = {
    ...form,
    [getFormKey(controlRef)]: control,
  };

  const controls = (<FormGroupConfig | FormArrayConfig>config).controls;

  // Adding controls for Form Group
  if (controls && !(controls instanceof Array)) {
    newForm = Object.entries((<FormGroupConfig>config).controls).reduce(
      (acc, [key, controlConfig]) => {
        return buildFormState(controlConfig, acc, controlRef.concat(key));
      },
      newForm,
    );
  } else if (controls && controls instanceof Array) {
    // Adding controls for Form Array
    newForm = (<FormArrayConfig>config).controls.reduce(
      (acc, controlConfig, index) => buildFormState(controlConfig, acc, controlRef.concat(index)),
      newForm,
    );
  }

  return newForm;
};
