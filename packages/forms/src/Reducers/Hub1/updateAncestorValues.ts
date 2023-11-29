import { Action } from '@reactables/core';
import { BaseForm } from '../../Models/Controls';
import { getFormKey } from '../../Helpers/getFormKey';
import { getDescendantControls } from '../../Helpers/getDescendantControls';
import { ControlRef } from '../../Models/ControlRef';

export const UPDATE_ANCESTOR_VALUES = 'UPDATE_ANCESTOR_VALUES';
export const updateAncestorValues = <T>(
  form: BaseForm<T>,
  { payload: controlRef }: Action<ControlRef>,
): BaseForm<T> => {
  if (controlRef.length) {
    const parentRef = controlRef.slice(0, -1);
    const parentKey = getFormKey(parentRef);

    const siblingControls = getDescendantControls(parentRef, form).filter(
      // Out of descendants we only need the siblings
      (control) => control.controlRef.length === controlRef.length,
    );

    let newValue: unknown;

    // If parent is a Form Array
    if (Array.isArray(form[parentKey].value)) {
      newValue = siblingControls
        .slice()
        .sort((a, b) => (a.controlRef.at(-1) as number) - (b.controlRef.at(-1) as number))
        .map((control) => control.value);
    } else {
      // If parent is a Form Group
      newValue = siblingControls.reduce((acc, { controlRef, value }) => {
        return {
          ...acc,
          [controlRef.at(-1)]: value,
        };
      }, {});
    }

    const newParentControl = {
      ...form[parentKey],
      value: newValue,
    };

    return updateAncestorValues(
      {
        ...form,
        [parentKey]: newParentControl,
      },
      {
        type: UPDATE_ANCESTOR_VALUES,
        payload: parentRef,
      },
    );
  }

  return form;
};
