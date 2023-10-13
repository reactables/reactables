import { updateValues } from './updateValues';
import { buildFormState } from '../../Helpers/buildFormState';
import { config, emergencyContactConfigs } from '../../Testing/config';
import { controlChange } from '../../Actions/Hub1/controlChange';
import { BaseForm } from '../../Models/Controls';
import { FormArrayConfig } from '../../Models/Configs';
import { Contact } from '../../Testing/Models/Contact';
import { EmergencyContact } from '../../Testing/Models/EmergencyContact';

describe('updateValues', () => {
  it('should update value and dirty status for control and its descendants/ancestors for FormGroup control', () => {
    const initialState: BaseForm<Contact> = buildFormState(config);

    const value = {
      firstName: 'Dr',
      lastName: 'Ho',
      email: 'drhoe.com', // Validate to catch invalid email
    };

    const result = updateValues(
      initialState,
      controlChange({ controlRef: ['doctorInfo'], value }),
    );

    expect(result.root.value.doctorInfo).toEqual(value);
    expect(result.doctorInfo.value).toEqual(value);
    expect(result['doctorInfo.firstName'].value).toBe(value.firstName);
    expect(result['doctorInfo.lastName'].value).toBe(value.lastName);
    expect(result['doctorInfo.email'].value).toBe(value.email);

    expect(result.root.dirty).toBe(true);
    expect(result.doctorInfo.dirty).toBe(true);
    expect(result['doctorInfo.firstName'].dirty).toBe(true);
    expect(result['doctorInfo.lastName'].dirty).toBe(true);
    expect(result['doctorInfo.email'].dirty).toBe(true);

    expect(result.root.validatorsValid).toBe(false);
    expect(result.doctorInfo.validatorsValid).toBe(false);
    expect(result['doctorInfo.firstName'].validatorsValid).toBe(true);
    expect(result['doctorInfo.lastName'].validatorsValid).toBe(true);
    expect(result['doctorInfo.email'].validatorsValid).toBe(false);
  });

  it('should update value and dirty status for control and its descendants/ancestors for a FormArray control', () => {
    const nonEmptyConfig = {
      ...(config.controls.emergencyContacts as FormArrayConfig),
      controls: emergencyContactConfigs,
    } as FormArrayConfig;

    const initialState: BaseForm<Contact> = buildFormState({
      ...config,
      controls: {
        ...config.controls,
        emergencyContacts: nonEmptyConfig,
      },
    });

    const value = 'Moe first name changed';

    const result = updateValues(
      initialState,
      controlChange({
        controlRef: ['emergencyContacts', 1, 'firstName'],
        value,
      }),
    );

    expect(result.root.value.emergencyContacts[1].firstName).toBe(value);

    expect(
      (result.emergencyContacts.value[1] as EmergencyContact).firstName,
    ).toBe(value);

    expect(
      (result['emergencyContacts.1'].value as EmergencyContact).firstName,
    ).toBe(value);

    expect(result['emergencyContacts.1.firstName'].value).toBe(value);

    expect(result.root.dirty).toBe(true);

    expect(result.emergencyContacts.dirty).toBe(true);

    expect(result['emergencyContacts.1'].dirty).toBe(true);

    expect(result['emergencyContacts.1.firstName'].dirty).toBe(true);
  });

  // it('should throw an error if trying to update a FG key that does not exist', () => {
  //   const initialState: BaseForm<Contact> = buildFormState(config);
  //   const value = {
  //     firstName: 'Dr',
  //     lastName: 'Ho',
  //     email: 'dr@hoe.com',
  //     xyz: 'not here',
  //   };

  //   const newStateFunc = () => {
  //     updateValues(
  //       initialState,
  //       controlChange({ controlRef: ['doctorInfo'], value }),
  //     );
  //   };

  //   expect(newStateFunc).toThrowError(
  //     `The number of keys do not match form group: doctorInfo`,
  //   );
  // });

  // it('should throw an error if trying to update a FA index that does not exist', () => {
  //   expect(newStateFunc).toThrowError(
  //     `The number of value items does not match the number of controls in array: emergencyContacts`,
  //   );
  // });
});
