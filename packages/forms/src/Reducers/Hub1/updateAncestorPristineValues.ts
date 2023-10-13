import { Action } from '@hub-fx/core';
import { BaseForm, BaseControl } from '../../Models/Controls';
import { getFormKey } from '../../Helpers/getFormKey';
import { getDescendantControls } from '../../Helpers/getDescendantControls';
import { ControlRef } from '../../Models/ControlRef';

// Same implementation as updateAncestor values except updating pristine values
export const UPDATE_ANCESTOR_PRISTINE_VALUES =
  'UPDATE_ANCESTOR_PRISTINE_VALUES';
export const updateAncestorPristineValues = <T>(
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
        .sort(
          (a, b) =>
            (a.controlRef.at(-1) as number) - (b.controlRef.at(-1) as number),
        )
        .map((control) => control.pristineValue);
    } else {
      // If parent is a Form Group
      newValue = siblingControls.reduce(
        (acc, { controlRef, pristineValue }) => {
          return {
            ...acc,
            [controlRef.at(-1)]: pristineValue,
          };
        },
        {},
      );
    }

    const newParentControl: BaseControl<unknown> = {
      ...form[parentKey],
      pristineValue: newValue,
    };

    return updateAncestorPristineValues(
      {
        ...form,
        [parentKey]: newParentControl,
      },
      {
        type: UPDATE_ANCESTOR_PRISTINE_VALUES,
        payload: parentRef,
      },
    );
  }

  return form;
};
