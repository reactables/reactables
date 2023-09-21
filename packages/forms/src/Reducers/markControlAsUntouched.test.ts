import cloneDeep from 'lodash.clonedeep';
import { markControlAsUntouched } from './markControlAsUntouched';
import { markControlAsTouched } from './markControlAsTouched';
import { buildControlState } from '../Helpers/buildControlState';
import { config } from '../Testing/config';
import { FormGroup } from '../Models/Controls';
import { Contact } from '../Testing/Models/Contact';
import { DoctorInfo } from '../Testing/Models/DoctorInfo';
import { FORMS_MARK_CONTROL_AS_UNTOUCHED } from '../Actions/markControlAsUntouched';
import { FORMS_MARK_CONTROL_AS_TOUCHED } from '../Actions/markControlAsTouched';

describe('markControlAsUntouched', () => {
  it('should mark control and all anscestors as touched', () => {
    const initialState = buildControlState(config);
    const touchedState = markControlAsTouched(initialState, {
      type: FORMS_MARK_CONTROL_AS_TOUCHED,
      payload: ['doctorInfo', 'firstName'],
    });

    const expectedState = cloneDeep(touchedState) as FormGroup<Contact>;
    expectedState.controls.doctorInfo.touched = false;
    (<FormGroup<DoctorInfo>>(
      expectedState.controls.doctorInfo
    )).controls.firstName.touched = false;

    const untouchedState = markControlAsUntouched(touchedState, {
      type: FORMS_MARK_CONTROL_AS_UNTOUCHED,
      payload: ['doctorInfo'],
    });

    expect(untouchedState).toEqual(expectedState);
  });
});
