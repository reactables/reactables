import { RxBuilder } from '@hub-fx/core';
import { syncValidate } from '../Reducers/Hub1/syncValidate';
import { updateValues } from '../Reducers/Hub1/updateValues';
import { removeControl } from '../Reducers/Hub1/removeControl';
import { addControl } from '../Reducers/Hub1/addControl';
import { markControlAsPristine } from '../Reducers/Hub1/markControlAsPristine';
import { markControlAsTouched } from '../Reducers/Hub1/markControlAsTouched';
import { markControlAsUntouched } from '../Reducers/Hub1/markControlAsUntouched';
import { resetControl } from '../Reducers/Hub1/resetControl';
import { BaseForm } from '../Models/Controls';

export const getHub1Slice = (initialState: BaseForm<unknown>) => {
  return RxBuilder.createSlice({
    initialState,
    reducers: {
      syncValidate,
      updateValues,
      removeControl,
      addControl,
      markControlAsPristine,
      markControlAsTouched,
      markControlAsUntouched,
      resetControl,
    },
  });
};
