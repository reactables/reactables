import cloneDeep from 'lodash.clonedeep';
import { handleAsyncValidationResponseSuccess } from './handleAsyncValidationResponseSuccess';
import { handleAsyncValidation } from './handleAsyncValidation';
import { buildControlState } from '../Helpers/buildControlState';
import { config, emergencyContactConfigs } from '../Testing/config';
import { FormGroup, FormArray } from '../Models/Controls';
import { FormArrayConfig, FormGroupConfig } from '../Models/Configs';
import { Contact } from '../Testing/Models/Contact';
import { EmergencyContact } from '../Testing/Models/EmergencyContact';
import { FORMS_VALUE_CHANGE_EFFECT } from '../Actions/valueChange';
import { FORMS_CONTROL_ASYNC_VALIDATION_RESPONSE_SUCCESS } from '../Actions/asyncValidationResponseSuccess';
import { getControl } from '../Helpers/getControl';

describe('handleAsyncValidationResponseSuccess', () => {
  it('should update errors for control', () => {
    const initialState = buildControlState(config) as FormGroup<Contact>;

    const validatedState = handleAsyncValidationResponseSuccess(initialState, {
      type: FORMS_CONTROL_ASYNC_VALIDATION_RESPONSE_SUCCESS,
      payload: {
        controlRef: ['email'],
        validatorIndex: 0,
        errors: {
          uniqueEmail: true,
        },
      },
    }) as FormGroup<Contact>;

    expect(validatedState.controls.email.errors.uniqueEmail).toBe(true);
  });

  it('should update pending status and errors for control', () => {
    const clonedConfig: FormGroupConfig = cloneDeep(config);
    (<FormArrayConfig>clonedConfig.controls.emergencyContacts).controls =
      emergencyContactConfigs;

    clonedConfig.asyncValidators = [];
    (<FormArrayConfig>clonedConfig.controls.emergencyContacts).asyncValidators =
      [];

    (<FormArrayConfig>clonedConfig.controls.emergencyContacts).controls.forEach(
      (control) => (control.asyncValidators = []),
    );

    const initialState = buildControlState(clonedConfig) as FormGroup<Contact>;

    const controlRef = ['emergencyContacts', 0, 'email'];
    const control = getControl(controlRef, initialState);

    const pendingState = handleAsyncValidation(initialState, {
      type: FORMS_VALUE_CHANGE_EFFECT,
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
    emergencyContactEmail.errors = {
      email: false,
      required: false,
      uniqueEmail: true,
    };

    let pendingSuccessState = handleAsyncValidationResponseSuccess(
      pendingState,
      {
        type: FORMS_CONTROL_ASYNC_VALIDATION_RESPONSE_SUCCESS,
        payload: {
          controlRef: ['emergencyContacts', 0, 'email'],
          validatorIndex: 0,
          errors: {
            uniqueEmail: true,
          },
        },
      },
    );

    expectedState.pending = true;
    emergencyContacts.pending = true;
    emergencyContact.pending = true;
    emergencyContactEmail.pending = true;

    expect(pendingSuccessState).toEqual(expectedState);

    pendingSuccessState = handleAsyncValidationResponseSuccess(
      pendingSuccessState,
      {
        type: FORMS_CONTROL_ASYNC_VALIDATION_RESPONSE_SUCCESS,
        payload: {
          controlRef: ['emergencyContacts', 0, 'email'],
          validatorIndex: 1,
          errors: {
            blacklistedEmail: true,
          },
        },
      },
    );

    emergencyContactEmail.asyncValidateInProgress = {
      0: false,
      1: false,
    };

    emergencyContactEmail.errors = {
      email: false,
      required: false,
      uniqueEmail: true,
      blacklistedEmail: true,
    };

    expectedState.pending = false;
    emergencyContacts.pending = false;
    emergencyContact.pending = false;
    emergencyContactEmail.pending = false;
    expect(pendingSuccessState).toEqual(expectedState);
  });
});
