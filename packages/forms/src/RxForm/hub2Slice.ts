import { RxBuilder } from '@hub-fx/core';
import { asyncValidation } from '../Reducers/Hub2/asyncValidation';
import { asyncValidationResponseSuccess } from '../Reducers/Hub2/asyncValidationResponseSuccess';
import { formChange } from '../Reducers/Hub2/formChange';

export const hub2Slice = RxBuilder.createSlice({
  initialState: null,
  reducers: {
    asyncValidation,
    asyncValidationResponseSuccess,
    formChange,
  },
});
