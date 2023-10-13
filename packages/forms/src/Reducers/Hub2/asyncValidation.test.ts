import { asyncValidation } from './asyncValidation';
import { buildFormState } from '../../Helpers/buildFormState';
import { config, emergencyContactConfigs } from '../../Testing/config';
import { Form, BaseForm } from '../../Models/Controls';
import { FormArrayConfig } from '../../Models/Configs';
import { Contact } from '../../Testing/Models/Contact';
import { FORMS_ASYNC_VALIDATE_CONTROL } from '../../Actions/Hub2/valueChange';
import { formChange } from './formChange';
import { formChange as formChangeAction } from '../../Actions/Hub2/formChange';

describe('asyncValidation', () => {
  it('should update validation', () => {
    const nonEmptyConfig = {
      ...(config.controls.emergencyContacts as FormArrayConfig),
      controls: emergencyContactConfigs,
    } as FormArrayConfig;

    const initialBaseState: BaseForm<Contact> = buildFormState({
      ...config,
      controls: {
        ...config.controls,
        emergencyContacts: nonEmptyConfig,
      },
    });

    const initialState = formChange(
      null,
      formChangeAction(initialBaseState),
    ) as Form<Contact>;

    const result = asyncValidation(initialState, {
      type: FORMS_ASYNC_VALIDATE_CONTROL,
      payload: initialBaseState['emergencyContacts.0.email'],
    });

    expect(result.root.pending).toBe(true);
    expect(result.emergencyContacts.pending).toBe(true);
    expect(result['emergencyContacts.0'].pending).toBe(true);
    expect(result['emergencyContacts.0.email'].pending).toBe(true);
    expect(result['emergencyContacts.0.email'].asyncValidateInProgress).toEqual(
      {
        0: true,
        1: true,
      },
    );
  });
});
