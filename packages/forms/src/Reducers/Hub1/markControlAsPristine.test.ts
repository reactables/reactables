import { updateValues } from './updateValues';
import { markControlAsPristine } from './markControlAsPristine';
import { buildFormState } from '../../Helpers/buildFormState';
import { config } from '../../Testing/config';
import { markControlAsPristine as markAsPristineAction } from '../../Actions/Hub1/markControlAsPristine';
import { Contact } from '../../Testing/Models/Contact';
import { DoctorInfo } from '../../Testing/Models/DoctorInfo';
import { BaseForm } from '../../Models/Controls';
import { controlChange } from '../../Actions/Hub1/controlChange';

describe('markControlAsPristine', () => {
  const newDoctorValue: DoctorInfo = {
    firstName: 'Dr',
    lastName: 'Ho',
    email: 'dr@hoe.com',
  };

  let initialState: BaseForm<Contact>;
  let changedState: BaseForm<Contact>;

  beforeEach(() => {
    initialState = buildFormState(config);
    changedState = updateValues(
      initialState,
      controlChange({ controlRef: ['doctorInfo'], value: newDoctorValue }),
    );
    expect(changedState.root.value.doctorInfo).toEqual(newDoctorValue);
    expect(changedState.root.dirty).toBe(true);
    expect(changedState.doctorInfo.value).toEqual(newDoctorValue);
    expect(changedState.doctorInfo.dirty).toBe(true);
    expect(changedState['doctorInfo.firstName'].value).toBe(
      newDoctorValue.firstName,
    );
    expect(changedState['doctorInfo.firstName'].dirty).toBe(true);
    expect(changedState['doctorInfo.lastName'].value).toBe(
      newDoctorValue.lastName,
    );
    expect(changedState['doctorInfo.lastName'].dirty).toBe(true);
    expect(changedState['doctorInfo.email'].value).toBe(newDoctorValue.email);
    expect(changedState['doctorInfo.email'].dirty).toBe(true);
  });

  it('should mark a control as pristine for a FC -> FG', () => {
    const result = markControlAsPristine(
      changedState,
      markAsPristineAction(['doctorInfo', 'firstName']),
    );
    expect(result.root.dirty).toBe(true);
    expect(result.doctorInfo.dirty).toBe(true);
    expect(result['doctorInfo.firstName'].dirty).toBe(false);
    expect(result['doctorInfo.lastName'].dirty).toBe(true);
    expect(result['doctorInfo.email'].dirty).toBe(true);
  });

  it('should mark a control as pristine for a FG -> FG', () => {
    const result = markControlAsPristine(
      changedState,
      markAsPristineAction(['doctorInfo']),
    );
    expect(result.root.dirty).toBe(false);
    expect(result.doctorInfo.dirty).toBe(false);
    expect(result['doctorInfo.firstName'].dirty).toBe(false);
    expect(result['doctorInfo.lastName'].dirty).toBe(false);
    expect(result['doctorInfo.email'].dirty).toBe(false);
  });
});
