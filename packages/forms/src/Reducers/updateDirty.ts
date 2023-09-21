import { FormArray, FormGroup, AbstractControl } from '../Models/Controls';

export const updateDirty = <T>(
  control: AbstractControl<T>,
): AbstractControl<T> => {
  let newControl: AbstractControl<T> = {
    ...control,
    dirty:
      JSON.stringify(control.value) !==
      JSON.stringify(control.pristineControl.value),
  };

  if (Array.isArray((<FormArray<T>>control).controls)) {
    const controls = (<FormArray<T>>control).controls;
    newControl = {
      ...newControl,
      controls: controls.map((control) => updateDirty(control)),
    } as FormArray<T>;
  } else if ((<FormGroup<T>>control).controls) {
    const controls = (<FormGroup<T>>control).controls;
    newControl = {
      ...newControl,
      controls: Object.entries(controls).reduce(
        (
          result: { [key: string]: AbstractControl<unknown> },
          [key, control],
        ) => {
          result[key] = updateDirty(control);
          return result;
        },
        {},
      ),
    } as FormGroup<T>;
  }

  return newControl;
};
