import cloneDeep from 'lodash.clonedeep';
import { updateValues } from './updateValues';
import { markControlAsPristine } from './markControlAsPristine';
import { buildControlState } from '../Helpers/buildControlState';
import { config } from '../Testing/config';
import { FORMS_CONTROL_CHANGE } from '../Actions/controlChange';
import { FORMS_MARK_CONTROL_AS_PRISTINE } from '../Actions/markControlAsPristine';
import { FormGroup } from '../Models/Controls';
import { Contact } from '../Testing/Models/Contact';
import { DoctorInfo } from '../Testing/Models/DoctorInfo';

describe('markControlAsPristine', () => {
  it('should mark a control as pristine for a FG -> FG', () => {
    const newDoctorValue = {
      firstName: 'Dr',
      lastName: 'Ho',
      email: 'dr@hoe.com',
    };
    const state = buildControlState(config) as FormGroup<Contact>;
    const expectedChangedState = cloneDeep(state);
    expectedChangedState.value = {
      ...expectedChangedState.value,
      doctorInfo: newDoctorValue,
    };
    expectedChangedState.controls.doctorInfo.value = newDoctorValue;
    const doctorControl = expectedChangedState.controls
      .doctorInfo as FormGroup<DoctorInfo>;
    doctorControl.controls.firstName.value = newDoctorValue.firstName;
    doctorControl.controls.lastName.value = newDoctorValue.lastName;
    doctorControl.controls.email.value = newDoctorValue.email;

    const changedState = updateValues(state, {
      type: FORMS_CONTROL_CHANGE,
      payload: {
        controlRef: ['doctorInfo'],
        value: {
          firstName: 'Dr',
          lastName: 'Ho',
          email: 'dr@hoe.com',
        },
      },
    }) as FormGroup<Contact>;

    expect(changedState).toEqual(expectedChangedState);

    const newPristineState = markControlAsPristine(changedState, {
      type: FORMS_MARK_CONTROL_AS_PRISTINE,
      payload: ['doctorInfo'],
    }) as FormGroup<Contact>;

    const doctorInfoControl: FormGroup<DoctorInfo> = cloneDeep(
      changedState.controls.doctorInfo as FormGroup<DoctorInfo>,
    );
    delete doctorInfoControl.pristineControl;

    const doctorInfoFirstNameControl = cloneDeep(
      doctorInfoControl.controls.firstName,
    );
    delete doctorInfoFirstNameControl.pristineControl;
    const doctorInfoLastNameControl = cloneDeep(
      doctorInfoControl.controls.lastName,
    );
    delete doctorInfoLastNameControl.pristineControl;
    const doctorInfoEmailControl = cloneDeep(doctorInfoControl.controls.email);
    delete doctorInfoEmailControl.pristineControl;

    const newPristineDoctorControl = newPristineState.controls
      .doctorInfo as FormGroup<DoctorInfo>;

    expect(newPristineState.controls.doctorInfo.pristineControl).toEqual(
      doctorInfoControl,
    );
    expect(newPristineDoctorControl.controls.firstName.pristineControl).toEqual(
      doctorInfoFirstNameControl,
    );
    expect(newPristineDoctorControl.controls.lastName.pristineControl).toEqual(
      doctorInfoLastNameControl,
    );
    expect(newPristineDoctorControl.controls.email.pristineControl).toEqual(
      doctorInfoEmailControl,
    );
  });
});
