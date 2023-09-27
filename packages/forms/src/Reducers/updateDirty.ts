import {
  BaseArrayControl,
  BaseGroupControl,
  BaseControl,
} from '../Models/Controls';

export const updateDirty = <T>(control: BaseControl<T>): BaseControl<T> => {
  let newControl: BaseControl<T> = {
    ...control,
    dirty:
      JSON.stringify(control.value) !==
      JSON.stringify(control.pristineControl.value),
  };

  if (Array.isArray((<BaseArrayControl<T>>control).controls)) {
    const controls = (<BaseArrayControl<T>>control).controls;
    newControl = {
      ...newControl,
      controls: controls.map((control) => updateDirty(control)),
    } as BaseArrayControl<T>;
  } else if ((<BaseGroupControl<T>>control).controls) {
    const controls = (<BaseGroupControl<T>>control).controls;
    newControl = {
      ...newControl,
      controls: Object.entries(controls).reduce(
        (result: { [key: string]: BaseControl<unknown> }, [key, control]) => {
          result[key] = updateDirty(control);
          return result;
        },
        {},
      ),
    } as BaseGroupControl<T>;
  }

  return newControl;
};
