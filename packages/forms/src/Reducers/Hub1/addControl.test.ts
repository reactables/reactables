import { addControl } from './addControl';
import { addControl as addControlAction } from '../../Actions/Hub1/addControl';
import { buildFormState } from '../../Helpers/buildFormState';
import { config, emergencyContactConfigs, firstNameNotSameAsLast } from '../../Testing/config';
import {
  uniqueFirstAndLastName,
  uniqueEmail,
  blacklistedEmail,
} from '../../Testing/AsyncValidators';
import { required, email } from '../../Validators';
import { BaseForm } from '../../Models/Controls';
import { Contact } from '../../Testing/Models/Contact';
import { FormArrayConfig, FormControlConfig } from '../../Models/Configs';
import { FormBuilder } from '../../Helpers/FormBuilder';
import { EmergencyContact } from '../../Testing/Models/EmergencyContact';
import { DoctorInfo } from '../../Testing/Models/DoctorInfo';

describe('addControl', () => {
  it('should add a control to a Form Array control and update ancestor values', () => {
    const nonEmptyConfig = {
      ...(config.controls.emergencyContacts as FormArrayConfig),
      controls: emergencyContactConfigs,
    } as FormArrayConfig;

    const newControlValue: EmergencyContact = {
      firstName: 'Third',
      lastName: 'Guy',
      email: 'thirdguy.com', // Validate to catch invalid email
      relation: 'third wheel',
    };

    const newControlConfig = FormBuilder.group({
      validators: [firstNameNotSameAsLast],
      asyncValidators: [uniqueFirstAndLastName],
      controls: {
        firstName: {
          initialValue: newControlValue.firstName,
          validators: [required],
        } as FormControlConfig<string>,
        lastName: {
          initialValue: newControlValue.lastName,
          validators: [required],
        } as FormControlConfig<string>,
        email: {
          initialValue: newControlValue.email,
          validators: [required, email],
          asyncValidators: [uniqueEmail, blacklistedEmail],
        } as FormControlConfig<string>,
        relation: {
          initialValue: newControlValue.relation,
          validators: [required],
        } as FormControlConfig<string>,
      },
    });

    const initialState: BaseForm<Contact> = buildFormState({
      ...config,
      controls: {
        ...config.controls,
        emergencyContacts: nonEmptyConfig,
      },
    });

    const result = addControl(
      initialState,
      addControlAction({
        controlRef: ['emergencyContacts'],
        config: newControlConfig,
      }),
    );

    expect(result.root.value.emergencyContacts[2]).toEqual(newControlValue);
    expect(result.emergencyContacts.value[2]).toEqual(newControlValue);
    expect(result['emergencyContacts.2'].value).toEqual(newControlValue);

    expect(result.root.dirty).toBe(true);
    expect(result.emergencyContacts.dirty).toBe(true);
    expect(result['emergencyContacts.2'].dirty).toBe(false);

    expect(result['emergencyContacts.2'].validatorsValid).toBe(false);
    expect(result['emergencyContacts.2.firstName'].validatorsValid).toBe(true);
    expect(result['emergencyContacts.2.lastName'].validatorsValid).toBe(true);
    expect(result['emergencyContacts.2.relation'].validatorsValid).toBe(true);
    expect(result['emergencyContacts.2.email'].validatorsValid).toBe(false);
  });

  it('should add a control to a Form Group control and update ancestor values', () => {
    const initialState: BaseForm<Contact> = buildFormState(config);

    const result = addControl(
      initialState,
      addControlAction({
        controlRef: ['doctorInfo', 'type'],
        config: FormBuilder.control({
          initialValue: 'proctologist',
        }),
      }),
    );

    expect(result.root.value.doctorInfo.type).toBe('proctologist');
    expect((result.doctorInfo.value as DoctorInfo).type).toBe('proctologist');
    expect(result['doctorInfo.type'].value).toBe('proctologist');

    expect(result.root.dirty).toBe(true);
    expect(result.doctorInfo.dirty).toBe(true);
    expect(result['doctorInfo.type'].dirty).toBe(false);
  });
});
