import {
  FormControlConfig,
  FormArrayConfig,
  FormGroupConfig,
  AbstractControlConfig,
} from '../Models/Configs';

export const getValueFromControlConfig = <T>(
  controlConfig: AbstractControlConfig,
): T => {
  const controls = (<FormArrayConfig | FormGroupConfig>controlConfig).controls;
  if (controls && !(controls instanceof Array)) {
    const result: { [key: string]: unknown } = {};

    for (const key in (<FormGroupConfig>controlConfig).controls) {
      const control = (<FormGroupConfig>controlConfig).controls[key];
      result[key] = getValueFromControlConfig(control);
    }

    return result as T;
  } else if (controls && controls instanceof Array) {
    const configs = (<FormArrayConfig>controlConfig).controls;
    const result = configs
      ? configs.map((controlConfig) => getValueFromControlConfig(controlConfig))
      : [];

    return result as T;
  } else {
    return (<FormControlConfig<T>>controlConfig).initialValue;
  }
};
