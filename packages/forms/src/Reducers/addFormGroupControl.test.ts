import cloneDeep from 'lodash.clonedeep';
import { FORMS_ADD_GROUP_CONTROL } from '../Actions/addGroupControl';
import { addFormGroupControl } from './addFormGroupControl';
import { buildControlState } from '../Helpers/buildControlState';
import { config } from '../Testing/config';
import { FormGroup } from '../Models/Controls';
import { FormControlConfig } from '../Models/Configs';
import { Contact } from '../Testing/Models/Contact';
import { DoctorInfo } from '../Testing/Models/DoctorInfo';

describe('addGroupFormControl', () => {
  it('should add a form control to a group', () => {
    const initialState = buildControlState(config) as FormGroup<Contact>;
    const controlRef = ['doctorInfo', 'type'];
    const newControlConfig: FormControlConfig<string> = {
      initialValue: 'proctology',
    };

    const expectedState = cloneDeep(initialState);
    expectedState.value = {
      ...expectedState.value,
      doctorInfo: {
        ...expectedState.value.doctorInfo,
        type: 'proctology',
      },
    };
    const doctorInfo = expectedState.controls
      .doctorInfo as FormGroup<DoctorInfo>;

    doctorInfo.value = {
      ...doctorInfo.value,
      type: 'proctology',
    };

    doctorInfo.controls.type = buildControlState(newControlConfig, controlRef);

    const newState = addFormGroupControl(initialState, {
      type: FORMS_ADD_GROUP_CONTROL,
      payload: { controlRef, config: newControlConfig },
    }) as FormGroup<Contact>;

    expect(newState).toEqual(expectedState);

    const occupationControlConfig: FormControlConfig<string> = {
      initialValue: 'carpenter',
    };

    const expectedStateWithOccupationControl = cloneDeep(expectedState);
    expectedStateWithOccupationControl.value = {
      ...expectedState.value,
      occupation: 'carpenter',
    };

    expectedStateWithOccupationControl.controls['occupation'] =
      buildControlState(occupationControlConfig, ['occupation']);

    const newStateWithOccupationControl = addFormGroupControl(newState, {
      type: FORMS_ADD_GROUP_CONTROL,
      payload: { controlRef: ['occupation'], config: occupationControlConfig },
    }) as FormGroup<Contact>;

    expect(newStateWithOccupationControl).toEqual(
      expectedStateWithOccupationControl,
    );
  });
});
