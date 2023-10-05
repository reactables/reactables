import { mergeErrors } from './mergeErrors';
import { buildControlState } from '../../Helpers/buildControlState';
import { BaseGroupControl, FormGroup } from '../../Models/Controls';
import { formChange } from './formChange';
import { formChange as formChangeAction } from '../../Actions';
import { FORMS_CONTROL_ASYNC_VALIDATION_RESPONSE_SUCCESS } from '../../Actions/Hub2/asyncValidationResponseSuccess';
import { asyncValidationResponseSuccess } from './asyncValidationResponseSuccess';
import { config } from '../../Testing/config';
import { Contact } from '../../Testing/Models/Contact';

describe('mergeErrors', () => {
  it('should merge validatorErrors and asyncValidatorErrors and set valid status', () => {
    const baseInitialState = buildControlState(
      config,
    ) as BaseGroupControl<Contact>;
    const initialState = formChange(null, formChangeAction(baseInitialState));

    const validatedState = asyncValidationResponseSuccess(initialState, {
      type: FORMS_CONTROL_ASYNC_VALIDATION_RESPONSE_SUCCESS,
      payload: {
        controlRef: ['email'],
        validatorIndex: 0,
        errors: {
          uniqueEmail: true,
        },
      },
    }) as FormGroup<Contact>;

    const newState = mergeErrors(validatedState);

    expect(newState.valid).toBe(false);
    expect(newState.controls.email.valid).toBe(false);

    expect(newState.controls.email.errors).toEqual({
      uniqueEmail: true,
      required: true,
      email: false,
    });
  });
});
