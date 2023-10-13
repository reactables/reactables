import { asyncValidationResponseSuccess } from './asyncValidationResponseSuccess';
import { asyncValidation } from './asyncValidation';
import { buildFormState } from '../../Helpers/buildFormState';
import { config, emergencyContactConfigs } from '../../Testing/config';
import { Form } from '../../Models/Controls';
import { FormGroupConfig } from '../../Models/Configs';
import { Contact } from '../../Testing/Models/Contact';
import { FORMS_ASYNC_VALIDATE_CONTROL } from '../../Actions/Hub2/valueChange';
import { asyncValidationResponseSuccess as asyncValidationResponseSuccessAction } from '../../Actions/Hub2/asyncValidationResponseSuccess';
import { getControl } from '../../Helpers/getControl';
import { formChange as formChangeAction } from '../../Actions';
import { formChange } from './formChange';

describe('asyncValidationResponseSuccess', () => {
  it('should update asyncValidatorErrors for control', () => {
    const baseInitialState = buildFormState(config);

    const initialState = formChange(null, formChangeAction(baseInitialState));
    const key = initialState.email.key;

    const validatedState = asyncValidationResponseSuccess(
      initialState,
      asyncValidationResponseSuccessAction({
        key,
        validatorIndex: 0,
        errors: {
          uniqueEmail: true,
        },
      }),
    ) as Form<Contact>;

    expect(validatedState.email.asyncValidatorErrors.uniqueEmail).toBe(true);
    expect(validatedState.email.asyncValidatorsValid).toBe(false);
    expect(validatedState.root.asyncValidatorsValid).toBe(false);
  });

  it('should update pending status and asyncValidatorErrors for control', () => {
    const initialConfig: FormGroupConfig = {
      ...config,
      controls: {
        ...config.controls,
        emergencyContacts: {
          ...config.controls.emergencyContacts,
          asyncValidators: [],
          controls: emergencyContactConfigs.reduce(
            (acc, config) => acc.concat({ ...config, asyncValidators: [] }),
            [] as FormGroupConfig[],
          ),
        },
      },
    };

    const baseInitialState = buildFormState(initialConfig);
    const initialState = formChange(null, formChangeAction(baseInitialState));

    const controlRef = ['emergencyContacts', 0, 'email'];
    const control = getControl(controlRef, initialState);

    const pendingState = asyncValidation(initialState, {
      type: FORMS_ASYNC_VALIDATE_CONTROL,
      payload: control,
    });

    expect(
      pendingState['emergencyContacts.0.email'].asyncValidateInProgress,
    ).toEqual({
      0: true,
      1: true,
    });

    const pendingSuccessState = asyncValidationResponseSuccess(
      pendingState,
      asyncValidationResponseSuccessAction({
        key: pendingState['emergencyContacts.0.email'].key,
        validatorIndex: 0,
        errors: {
          uniqueEmail: true,
        },
      }),
    );

    expect(
      pendingSuccessState['emergencyContacts.0.email'].asyncValidatorErrors,
    ).toEqual({
      uniqueEmail: true,
    });
    expect(
      pendingSuccessState['emergencyContacts.0.email'].asyncValidateInProgress,
    ).toEqual({
      0: false,
      1: true,
    });

    expect(pendingSuccessState.root.pending).toBe(true);
    expect(pendingSuccessState.emergencyContacts.pending).toBe(true);
    expect(pendingSuccessState['emergencyContacts.0'].pending).toBe(true);
    expect(pendingSuccessState['emergencyContacts.0.email'].pending).toBe(true);

    expect(pendingSuccessState.root.asyncValidatorsValid).toBe(false);
    expect(pendingSuccessState.emergencyContacts.asyncValidatorsValid).toBe(
      false,
    );
    expect(
      pendingSuccessState['emergencyContacts.0'].asyncValidatorsValid,
    ).toBe(false);
    expect(
      pendingSuccessState['emergencyContacts.0.email'].asyncValidatorsValid,
    ).toBe(false);

    const pendingSuccessState2 = asyncValidationResponseSuccess(
      pendingSuccessState,
      asyncValidationResponseSuccessAction({
        key: pendingState['emergencyContacts.0.email'].key,
        validatorIndex: 1,
        errors: {
          blacklistedEmail: true,
        },
      }),
    );

    expect(
      pendingSuccessState2['emergencyContacts.0.email'].asyncValidateInProgress,
    ).toEqual({
      0: false,
      1: false,
    });

    expect(
      pendingSuccessState2['emergencyContacts.0.email'].asyncValidatorErrors,
    ).toEqual({
      uniqueEmail: true,
      blacklistedEmail: true,
    });

    expect(pendingSuccessState2.root.pending).toBe(false);
    expect(pendingSuccessState2.emergencyContacts.pending).toBe(false);
    expect(pendingSuccessState2['emergencyContacts.0'].pending).toBe(false);
    expect(pendingSuccessState2['emergencyContacts.0.email'].pending).toBe(
      false,
    );

    expect(pendingSuccessState2.root.asyncValidatorsValid).toBe(false);
    expect(pendingSuccessState2.emergencyContacts.asyncValidatorsValid).toBe(
      false,
    );
    expect(
      pendingSuccessState2['emergencyContacts.0'].asyncValidatorsValid,
    ).toBe(false);
    expect(
      pendingSuccessState2['emergencyContacts.0.email'].asyncValidatorsValid,
    ).toBe(false);
  });
});
