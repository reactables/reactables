import cloneDeep from 'lodash.clonedeep';
import { asyncValidationResponseSuccess } from './asyncValidationResponseSuccess';
import { asyncValidation } from './asyncValidation';
import { buildControlState } from '../../Helpers/buildControlState';
import { config, emergencyContactConfigs } from '../../Testing/config';
import {
  FormGroup,
  FormArray,
  AbstractControl,
  BaseGroupControl,
} from '../../Models/Controls';
import { FormArrayConfig, FormGroupConfig } from '../../Models/Configs';
import { Contact } from '../../Testing/Models/Contact';
import { EmergencyContact } from '../../Testing/Models/EmergencyContact';
import { FORMS_ASYNC_VALIDATE_CONTROL } from '../../Actions/Hub2/valueChange';
import { FORMS_CONTROL_ASYNC_VALIDATION_RESPONSE_SUCCESS } from '../../Actions/Hub2/asyncValidationResponseSuccess';
import { getControl } from '../../Helpers/getControl';
import { formChange as formChangeAction } from '../../Actions';
import { formChange } from './formChange';

describe('handleAsyncValidationResponseSuccess', () => {
  it('should update asyncValidatorErrors for control', () => {
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

    expect(validatedState.controls.email.asyncValidatorErrors.uniqueEmail).toBe(
      true,
    );
    expect(validatedState.controls.email.asyncValidatorsValid).toBe(false);
    expect(validatedState.asyncValidatorsValid).toBe(false);
  });

  it('should update pending status and asyncValidatorErrors for control', () => {
    const clonedConfig: FormGroupConfig = cloneDeep(config);
    (<FormArrayConfig>clonedConfig.controls.emergencyContacts).controls =
      emergencyContactConfigs;

    clonedConfig.asyncValidators = [];
    (<FormArrayConfig>clonedConfig.controls.emergencyContacts).asyncValidators =
      [];

    (<FormArrayConfig>clonedConfig.controls.emergencyContacts).controls.forEach(
      (control) => (control.asyncValidators = []),
    );

    const baseInitialState = buildControlState(
      clonedConfig,
    ) as BaseGroupControl<Contact>;
    const initialState = formChange(null, formChangeAction(baseInitialState));

    const controlRef = ['emergencyContacts', 0, 'email'];
    const control = getControl(
      controlRef,
      initialState,
    ) as AbstractControl<unknown>;

    const pendingState = asyncValidation(initialState, {
      type: FORMS_ASYNC_VALIDATE_CONTROL,
      payload: control,
    }) as FormGroup<Contact>;

    const expectedState: FormGroup<Contact> = cloneDeep(pendingState);

    const emergencyContacts = <FormArray<EmergencyContact[]>>(
      expectedState.controls.emergencyContacts
    );

    const emergencyContact = <FormGroup<EmergencyContact>>(
      emergencyContacts.controls[0]
    );

    const emergencyContactEmail = emergencyContact.controls.email;
    emergencyContactEmail.asyncValidateInProgress = {
      0: false,
      1: true,
    };
    emergencyContactEmail.asyncValidatorErrors = {
      uniqueEmail: true,
    };

    let pendingSuccessState = asyncValidationResponseSuccess(pendingState, {
      type: FORMS_CONTROL_ASYNC_VALIDATION_RESPONSE_SUCCESS,
      payload: {
        controlRef: ['emergencyContacts', 0, 'email'],
        validatorIndex: 0,
        errors: {
          uniqueEmail: true,
        },
      },
    });

    expectedState.pending = true;
    expectedState.pending = true;
    emergencyContacts.pending = true;
    emergencyContact.pending = true;
    emergencyContactEmail.pending = true;
    expectedState.asyncValidatorsValid = false;
    emergencyContacts.asyncValidatorsValid = false;
    emergencyContact.asyncValidatorsValid = false;
    emergencyContactEmail.asyncValidatorsValid = false;

    expect(pendingSuccessState).toEqual(expectedState);

    pendingSuccessState = asyncValidationResponseSuccess(pendingSuccessState, {
      type: FORMS_CONTROL_ASYNC_VALIDATION_RESPONSE_SUCCESS,
      payload: {
        controlRef: ['emergencyContacts', 0, 'email'],
        validatorIndex: 1,
        errors: {
          blacklistedEmail: true,
        },
      },
    });

    emergencyContactEmail.asyncValidateInProgress = {
      0: false,
      1: false,
    };

    emergencyContactEmail.asyncValidatorErrors = {
      uniqueEmail: true,
      blacklistedEmail: true,
    };

    expectedState.pending = false;
    emergencyContacts.pending = false;
    emergencyContact.pending = false;
    emergencyContactEmail.pending = false;
    expectedState.asyncValidatorsValid = false;
    emergencyContacts.asyncValidatorsValid = false;
    emergencyContact.asyncValidatorsValid = false;
    emergencyContactEmail.asyncValidatorsValid = false;
    expect(pendingSuccessState).toEqual(expectedState);
  });
});
