import cloneDeep from 'lodash.clonedeep';
import { markControlAsTouched } from './markControlAsTouched';
import { buildControlState } from '../Helpers/buildControlState';
import { config } from '../Testing/config';
import { FormGroup } from '../Models/Controls';
import { Contact } from '../Testing/Models/Contact';
import { DoctorInfo } from '../Testing/Models/DoctorInfo';
import { FORMS_MARK_CONTROL_AS_TOUCHED } from '../Actions/markControlAsTouched';

describe('markControlAsTouched', () => {
  it('should mark control and all anscestors as touched', () => {
    const initialState = buildControlState(config);
    const newState = markControlAsTouched(initialState, {
      type: FORMS_MARK_CONTROL_AS_TOUCHED,
      payload: ['doctorInfo', 'firstName'],
    });

    const expectedState = cloneDeep(initialState) as FormGroup<Contact>;

    expectedState.touched = true;
    (<FormGroup<DoctorInfo>>expectedState.controls.doctorInfo).touched = true;
    (<FormGroup<DoctorInfo>>(
      expectedState.controls.doctorInfo
    )).controls.firstName.touched = true;

    expect(newState).toEqual(expectedState);
  });
});
