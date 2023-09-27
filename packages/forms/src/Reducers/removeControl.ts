import cloneDeep from 'lodash.clonedeep';
import { Action } from '@hub-fx/core';
import {
  BaseArrayControl,
  BaseGroupControl,
  BaseControl,
} from '../Models/Controls';
import { ControlRef } from '../Models/ControlRef';
import { getControl } from '../Helpers/getControl';
import {
  updateAncestorValues,
  FORMS_UPDATE_ANCESTOR_VALUES,
} from './updateAncestorValues';
import { FormArrayConfig, FormGroupConfig } from '../Models';

const reindexControl = (
  control: BaseControl<unknown>,
  arrayRef: ControlRef,
  newIndex: number,
) => {
  const newControl = cloneDeep(control);
  const controls = (<FormArrayConfig | FormGroupConfig>newControl.config)
    .controls;

  if (controls && !(controls instanceof Array)) {
    Object.entries((<BaseGroupControl<unknown>>newControl).controls).forEach(
      ([key, control]) => {
        (<BaseGroupControl<unknown>>newControl).controls[key] = reindexControl(
          control,
          arrayRef,
          newIndex,
        );
      },
    );
  } else if (controls && controls instanceof Array) {
    (<BaseArrayControl<unknown>>newControl).controls.forEach(
      (control, index) => {
        (<BaseArrayControl<unknown>>newControl).controls[index] =
          reindexControl(control, arrayRef, newIndex);
      },
    );
  }
  return {
    ...newControl,
    controlRef: arrayRef
      .concat(newIndex)
      .concat(control.controlRef.slice(arrayRef.length + 1)),
  };
};

export const removeControl = <T>(
  state: BaseControl<T>,
  { payload: controlRef }: Action<ControlRef>,
) => {
  if (!getControl(controlRef, state)) {
    throw 'Control not found';
  }

  if (!controlRef.length) return state;

  const newState = cloneDeep(state);

  const parentControl = getControl(controlRef.slice(0, -1), newState);
  const key = controlRef.slice(-1)[0];
  const controls = (<FormArrayConfig | FormGroupConfig>parentControl.config)
    .controls;

  if (controls && !(controls instanceof Array)) {
    delete (<BaseGroupControl<unknown>>parentControl).controls[key];
  } else if (controls && controls instanceof Array) {
    const result = (<BaseArrayControl<unknown>>parentControl).controls
      .filter((_, index) => index !== key)
      .map((control, index) =>
        reindexControl(control, parentControl.controlRef, index),
      );

    (<BaseArrayControl<unknown>>parentControl).controls = result;
  }

  return updateAncestorValues(newState, {
    type: FORMS_UPDATE_ANCESTOR_VALUES,
    payload: controlRef,
  });
};
