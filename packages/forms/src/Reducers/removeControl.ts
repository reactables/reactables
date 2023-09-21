import cloneDeep from 'lodash.clonedeep';
import { Action } from '@hubfx/core';
import { FormArray, FormGroup, AbstractControl } from '../Models/Controls';
import { ControlRef } from '../Models/ControlRef';
import { getControl } from '../Helpers/getControl';
import {
  updateAncestorValues,
  FORMS_UPDATE_ANCESTOR_VALUES,
} from './updateAncestorValues';
import { FormArrayConfig, FormGroupConfig } from '../Models';

const reindexControl = (
  control: AbstractControl<unknown>,
  arrayRef: ControlRef,
  newIndex: number,
) => {
  const newControl = cloneDeep(control);
  const controls = (<FormArrayConfig | FormGroupConfig>newControl.config)
    .controls;

  if (controls && !(controls instanceof Array)) {
    Object.entries((<FormGroup<unknown>>newControl).controls).forEach(
      ([key, control]) => {
        (<FormGroup<unknown>>newControl).controls[key] = reindexControl(
          control,
          arrayRef,
          newIndex,
        );
      },
    );
  } else if (controls && controls instanceof Array) {
    (<FormArray<unknown>>newControl).controls.forEach((control, index) => {
      (<FormArray<unknown>>newControl).controls[index] = reindexControl(
        control,
        arrayRef,
        newIndex,
      );
    });
  }
  return {
    ...newControl,
    controlRef: arrayRef
      .concat(newIndex)
      .concat(control.controlRef.slice(arrayRef.length + 1)),
  };
};

export const removeControl = <T>(
  state: AbstractControl<T>,
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
    delete (<FormGroup<unknown>>parentControl).controls[key];
  } else if (controls && controls instanceof Array) {
    const result = (<FormArray<unknown>>parentControl).controls
      .filter((_, index) => index !== key)
      .map((control, index) =>
        reindexControl(control, parentControl.controlRef, index),
      );

    (<FormArray<unknown>>parentControl).controls = result;
  }

  return updateAncestorValues(newState, {
    type: FORMS_UPDATE_ANCESTOR_VALUES,
    payload: controlRef,
  });
};
