import { formChange } from './formChange';
import { buildFormState } from '../../Helpers/buildFormState';
import { FORMS_FORM_CHANGE } from '../../Actions/Hub2/formChange';
import { BaseForm, Form } from '../../Models/Controls';
import {} from '../../Models/Controls';
import { Contact } from '../../Testing/Models/Contact';
import { formChange as formChangeAction } from '../../Actions/Hub2/formChange';
import { updateValues } from '../Hub1/updateValues';
import { removeControl } from '../Hub1/removeControl';
import { config } from '../../Testing/config';
import { EmergencyContact } from '../../Testing/Models/EmergencyContact';
import { addControl } from '../Hub1/addControl';
import { addControl as addControlAction } from '../../Actions/Hub1/addControl';
import { controlChange } from '../../Actions';
import { removeControl as removeControlAction } from '../../Actions/Hub1/removeControl';
import { FormBuilder } from '../../Helpers/FormBuilder';

describe('formChange', () => {
  it('should initialize async properties', () => {
    const initialBaseState = buildFormState(config);
    const result = formChange(null, formChangeAction(initialBaseState));

    expect(result.root).toEqual({
      ...initialBaseState.root,
      asyncValidatorsValid: true,
      asyncValidatorErrors: {},
      asyncValidateInProgress: {},
      pending: false,
      valid: true,
      errors: {},
    });

    expect(result['doctorInfo.firstName']).toEqual({
      ...initialBaseState['doctorInfo.firstName'],
      asyncValidatorsValid: true,
      asyncValidatorErrors: {},
      asyncValidateInProgress: {},
      pending: false,
      valid: true,
      errors: {},
    });
  });

  it('should update syncrounous properties only', () => {
    const initialBaseState: BaseForm<Contact> = buildFormState(config);

    const initialState = formChange(
      null,
      formChangeAction(initialBaseState),
    ) as Form<Contact>;

    const newBaseState = updateValues(
      initialBaseState,
      controlChange({
        controlRef: ['doctorInfo', 'firstName'],
        value: 'Dr First Name Change',
      }),
    );

    const result = formChange(initialState, formChangeAction(newBaseState));

    expect(result['doctorInfo.firstName']).toEqual({
      ...initialState['doctorInfo.firstName'],
      value: 'Dr First Name Change',
      dirty: true,
      validatorErrors: {
        required: false,
      },
      validatorsValid: true,
      errors: {
        required: false,
      },
      valid: true,
    });
  });

  it('should remove control', () => {
    const initialBaseState = buildFormState(config);

    const initialState = formChange(null, {
      type: FORMS_FORM_CHANGE,
      payload: initialBaseState,
    });
    const newBaseState = removeControl(
      initialBaseState,
      removeControlAction(['doctorInfo']),
    );

    const result = formChange(initialState, formChangeAction(newBaseState));

    expect(Object.keys(result)).toEqual([
      'root',
      'firstName',
      'lastName',
      'email',
      'phone',
      'emergencyContacts',
    ]);

    expect(result.root).toEqual({
      ...newBaseState.root,
      asyncValidatorsValid: true,
      asyncValidatorErrors: {},
      asyncValidateInProgress: {},
      pending: false,
      valid: false,
      errors: {
        firstNameNotSameAsLast: true,
      },
    });
  });

  it('should add control', () => {
    const initialValue: EmergencyContact = {
      firstName: 'Homer',
      lastName: 'Simpson',
      email: 'homer@homer.com',
      relation: 'friend',
    };

    const initialBaseState: BaseForm<Contact> = buildFormState(config);

    const newBaseState = addControl(
      initialBaseState,
      addControlAction({
        controlRef: ['emergencyContacts'],
        config: FormBuilder.group({
          controls: {
            firstName: FormBuilder.control({
              initialValue: initialValue.firstName,
            }),
            lastName: FormBuilder.control({
              initialValue: initialValue.lastName,
            }),
            email: FormBuilder.control({
              initialValue: initialValue.email,
            }),
            relation: FormBuilder.control({
              initialValue: initialValue.relation,
            }),
          },
        }),
      }),
    );

    const newState = formChange(
      null,
      formChangeAction(initialBaseState),
    ) as Form<Contact>;

    const result = formChange(newState, formChangeAction(newBaseState));

    expect(Object.keys(result)).toEqual([
      'root',
      'firstName',
      'lastName',
      'email',
      'phone',
      'emergencyContacts',
      'doctorInfo',
      'doctorInfo.firstName',
      'doctorInfo.lastName',
      'doctorInfo.email',
      'emergencyContacts.0',
      'emergencyContacts.0.firstName',
      'emergencyContacts.0.lastName',
      'emergencyContacts.0.email',
      'emergencyContacts.0.relation',
    ]);

    expect(result.root).toEqual({
      ...newBaseState.root,
      asyncValidatorsValid: true,
      asyncValidatorErrors: {},
      asyncValidateInProgress: {},
      pending: false,
      valid: false,
      errors: {
        firstNameNotSameAsLast: true,
      },
    });
  });
});
