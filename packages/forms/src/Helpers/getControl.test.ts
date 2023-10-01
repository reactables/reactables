import { getControl } from './getControl';
import { buildControlState } from './buildControlState';
import { config } from '../Testing/config';
import {
  BaseGroupControl,
  BaseArrayControl,
  BaseControl,
} from '../Models/Controls';
import { FormArrayConfig, FormGroupConfig } from '../Models/Configs';
import { Contact } from '../Testing/Models/Contact';
import { EmergencyContact } from '../Testing/Models/EmergencyContact';

describe('getControl', () => {
  const contactFormGroup = buildControlState(
    config,
  ) as BaseGroupControl<Contact>;

  const BASE_FORM_CONTROL = {
    dirty: false,
    touched: false,
  };

  it('should get form control', () => {
    const expectedControl = {
      ...BASE_FORM_CONTROL,
      config: config.controls.firstName,
      controlRef: ['firstName'],
      value: '',
      validatorErrors: {
        required: true,
      },
    } as BaseControl<string>;
    expect(getControl(['firstName'], contactFormGroup)).toEqual({
      pristineControl: expectedControl,
      ...expectedControl,
    });

    const expectedControlDoctorInfoFirstName = {
      ...BASE_FORM_CONTROL,
      config: (<FormGroupConfig>config.controls.doctorInfo).controls.firstName,
      controlRef: ['doctorInfo', 'firstName'],
      value: '',
      validatorErrors: {
        required: true,
      },
    } as BaseControl<string>;

    expect(getControl(['doctorInfo', 'firstName'], contactFormGroup)).toEqual({
      pristineControl: expectedControlDoctorInfoFirstName,
      ...expectedControlDoctorInfoFirstName,
    });

    const expectedEmergencyContactsControl = {
      ...BASE_FORM_CONTROL,
      config: <FormArrayConfig>config.controls.emergencyContacts,
      controlRef: ['emergencyContacts'],
      value: [] as EmergencyContact[],
      controls: [] as BaseControl<EmergencyContact>[],
      validatorErrors: {
        required: true,
      },
    } as BaseArrayControl<EmergencyContact[]>;

    expect(getControl(['emergencyContacts'], contactFormGroup)).toEqual({
      pristineControl: expectedEmergencyContactsControl,
      ...expectedEmergencyContactsControl,
    });
  });
});
