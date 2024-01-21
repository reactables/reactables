import { AbstractControlConfig } from '../Models/Configs';
import { BaseForm, BaseControl, BaseFormState } from '../Models/Controls';
import { ControlRef } from '../Models/ControlRef';
import { FormArrayConfig, FormGroupConfig } from '../Models/Configs';
import { getValueFromControlConfig } from './getValueFromControlConfig';
import { getFormKey } from './getFormKey';
import { generateKey } from './generateKey';
import { getErrors } from '../Reducers/Hub1/getErrors';
import { RxFormProviders } from '../RxForm/RxForm';

export const buildState = <T>(
  config: AbstractControlConfig,
  form: BaseForm<T> = { root: null },
  controlRef: ControlRef = [],
  providers: RxFormProviders,
): BaseForm<T> => {
  const value = getValueFromControlConfig(config);
  const control: BaseControl<unknown> = {
    pristineValue: value,
    dirty: false,
    touched: false,
    value,
    controlRef,
    validatorErrors: {},
    config,
    key: generateKey(5),
  };

  let newForm: BaseForm<T> = {
    ...form,
    [getFormKey(controlRef)]: {
      ...control,
      validatorErrors: getErrors(control, value, providers),
    },
  };

  const controls = (<FormGroupConfig | FormArrayConfig>config).controls;

  // Adding controls for Form Group
  if (controls && !(controls instanceof Array)) {
    newForm = Object.entries((<FormGroupConfig>config).controls).reduce(
      (acc, [key, controlConfig]) => {
        return buildState(controlConfig, acc, controlRef.concat(key), providers);
      },
      newForm,
    );
  } else if (controls && controls instanceof Array) {
    // Adding controls for Form Array
    newForm = (<FormArrayConfig>config).controls.reduce(
      (acc, controlConfig, index) =>
        buildState(controlConfig, acc, controlRef.concat(index), providers),
      newForm,
    );
  }

  return newForm;
};

export const buildFormState = <T>(
  config: AbstractControlConfig,
  form: BaseForm<T> = { root: null },
  controlRef: ControlRef = [],
  providers: RxFormProviders,
): BaseFormState<T> => {
  return {
    form: buildState(config, form, controlRef, providers),
  };
};
