import { resetControl } from './resetControl';
import { buildFormState } from '../../Helpers/buildFormState';
import { resetControl as resetControlAction } from '../../Actions/Hub1/resetControl';
import { BaseForm } from '../../Models/Controls';
import { Contact } from '../../Testing/Models/Contact';
import { config, emergencyContactConfigs } from '../../Testing/config';
import { updateValues } from './updateValues';
import { controlChange } from '../../Actions/Hub1/controlChange';
import { syncValidate } from './syncValidate';
import { FormArrayConfig } from '../../Models/Configs';
import { EmergencyContact } from '../../Testing/Models/EmergencyContact';

describe('resetControl', () => {
  let initialState: BaseForm<Contact>;
  beforeEach(() => {
    initialState = syncValidate(buildFormState(config));
  });
  it('should reset a Form Control, and update ancestor values and dirty status', () => {
    const changedState = updateValues(
      initialState,
      controlChange({ controlRef: ['firstName'], value: 'Changed first name' }),
    );

    expect(changedState.root.value.firstName).toBe('Changed first name');

    const resetAtRoot = resetControl(changedState, resetControlAction([]));
    expect(resetAtRoot.value).toEqual(initialState.value);

    const resetAtFirstName = resetControl(changedState, resetControlAction(['firstName']));

    expect(resetAtFirstName.value).toEqual(initialState.value);
  });
  it('should reset a Form Group control, all of its descendants and update ancestor values and dirty status', () => {
    const newValue = {
      firstName: 'Dr',
      lastName: 'Ho',
      email: 'dr@ho.com',
    };
    const changedState = updateValues(
      initialState,
      controlChange({ controlRef: ['doctorInfo'], value: newValue }),
    );
    expect(changedState.root.value.doctorInfo).toEqual(newValue);

    const resetAtRoot = resetControl(changedState, resetControlAction([]));
    expect(resetAtRoot.value).toEqual(initialState.value);

    const resetAtDoctorInfo = resetControl(changedState, resetControlAction(['doctorInfo']));

    expect(resetAtDoctorInfo.value).toBe(initialState.value);

    const resetAtDoctorInfoFirstName: BaseForm<Contact> = resetControl(
      changedState,
      resetControlAction(['doctorInfo', 'firstName']),
    ) as BaseForm<Contact>;

    expect(resetAtDoctorInfoFirstName.root.value.doctorInfo).toEqual({
      firstName: '',
      lastName: 'Ho',
      email: 'dr@ho.com',
    });
    expect(resetAtDoctorInfoFirstName.root.dirty).toBe(true);
    expect(resetAtDoctorInfoFirstName.doctorInfo.value).toEqual({
      firstName: '',
      lastName: 'Ho',
      email: 'dr@ho.com',
    });
    expect(resetAtDoctorInfoFirstName.doctorInfo.dirty).toBe(true);
    expect(resetAtDoctorInfoFirstName['doctorInfo.firstName'].value).toBe('');
    expect(resetAtDoctorInfoFirstName['doctorInfo.firstName'].dirty).toBe(false);
    expect(resetAtDoctorInfoFirstName['doctorInfo.lastName'].value).toBe('Ho');
    expect(resetAtDoctorInfoFirstName['doctorInfo.lastName'].dirty).toBe(true);
    expect(resetAtDoctorInfoFirstName['doctorInfo.email'].value).toBe('dr@ho.com');
    expect(resetAtDoctorInfoFirstName['doctorInfo.email'].dirty).toBe(true);
  });

  it('should reset a Form Array control, all of its descendants and update ancestor values and dirty status', () => {
    const nonEmptyConfig = {
      ...(config.controls.emergencyContacts as FormArrayConfig),
      controls: emergencyContactConfigs,
    } as FormArrayConfig;

    const initialState: BaseForm<Contact> = syncValidate(
      buildFormState({
        ...config,
        controls: {
          ...config.controls,
          emergencyContacts: nonEmptyConfig,
        },
      }),
    );

    const newValue = {
      firstName: 'Hans',
      lastName: 'Moleman',
      email: 'hans@moleman.com',
      relation: 'second son of homer',
    };

    const changedState = updateValues(
      initialState,
      controlChange({
        controlRef: ['emergencyContacts', 1],
        value: newValue,
      }),
    );

    expect(changedState.root.value.emergencyContacts[1]).toEqual(newValue);
    expect(changedState.root.dirty).toBe(true);

    expect(changedState.emergencyContacts.dirty).toBe(true);

    const resetAtRoot = resetControl(changedState, resetControlAction([]));
    expect(resetAtRoot.value).toEqual(initialState.value);

    const resetAtEmergencyContacts = resetControl(
      changedState,
      resetControlAction(['emergencyContacts']),
    );

    expect(resetAtEmergencyContacts.value).toEqual(initialState.value);

    const resetAtEmergencyContacts1 = resetControl(
      changedState,
      resetControlAction(['emergencyContacts', 1]),
    );

    expect(resetAtEmergencyContacts1.value).toEqual(initialState.value);

    const resetAtEmergencyContacts1FirstName = resetControl(
      changedState,
      resetControlAction(['emergencyContacts', 1, 'firstName']),
    ) as BaseForm<Contact>;

    expect(resetAtEmergencyContacts1FirstName.root.value.emergencyContacts[1].firstName).toBe(
      'moe',
    );

    expect(resetAtEmergencyContacts1FirstName.root.dirty).toBe(true);

    expect(
      (resetAtEmergencyContacts1FirstName.emergencyContacts.value as EmergencyContact[])[1]
        .firstName,
    ).toBe('moe');

    expect(resetAtEmergencyContacts1FirstName.emergencyContacts.dirty).toBe(true);

    expect(
      (resetAtEmergencyContacts1FirstName.emergencyContacts.value as EmergencyContact[])[1],
    ).toEqual({
      firstName: 'moe',
      lastName: 'Moleman',
      email: 'hans@moleman.com',
      relation: 'second son of homer',
    });

    expect(resetAtEmergencyContacts1FirstName['emergencyContacts.1'].value).toEqual({
      firstName: 'moe',
      lastName: 'Moleman',
      email: 'hans@moleman.com',
      relation: 'second son of homer',
    });

    expect(resetAtEmergencyContacts1FirstName['emergencyContacts.1'].dirty).toBe(true);

    expect(resetAtEmergencyContacts1FirstName['emergencyContacts.1.firstName'].value).toBe('moe');
    expect(resetAtEmergencyContacts1FirstName['emergencyContacts.1.firstName'].dirty).toBe(false);
  });
});
