import cloneDeep from 'lodash.clonedeep';
import { handleAsyncValidation } from './handleAsyncValidation';
import { buildControlState } from '../Helpers/buildControlState';
import { config, emergencyContactConfigs } from '../Testing/config';
import { FormGroup, FormArray } from '../Models/Controls';
import { FormArrayConfig, FormGroupConfig } from '../Models/Configs';
import { Contact } from '../Testing/Models/Contact';
import { EmergencyContact } from '../Testing/Models/EmergencyContact';
import { FORMS_VALUE_CHANGE_EFFECT } from '../Actions/valueChange';
import { getControl } from '../Helpers/getControl';

describe('handleAsyncValidation', () => {
  it('should update validation', () => {
    const clonedConfig: FormGroupConfig = cloneDeep(config);
    (<FormArrayConfig>clonedConfig.controls.emergencyContacts).controls =
      emergencyContactConfigs;
    const initialState = buildControlState(clonedConfig) as FormGroup<Contact>;

    const expectedState: FormGroup<Contact> = cloneDeep(initialState);

    const emergencyContacts = <FormArray<EmergencyContact[]>>(
      expectedState.controls.emergencyContacts
    );

    const emergencyContact = <FormGroup<EmergencyContact>>(
      emergencyContacts.controls[0]
    );

    const emergencyContactEmail = emergencyContact.controls.email;

    expectedState.pending = true;
    emergencyContacts.pending = true;
    emergencyContact.pending = true;
    emergencyContactEmail.pending = true;
    emergencyContactEmail.asyncValidateInProgress = { 0: true, 1: true };

    const controlRef = ['emergencyContacts', 0, 'email'];
    const control = getControl(controlRef, initialState);

    const newState = handleAsyncValidation(initialState, {
      type: FORMS_VALUE_CHANGE_EFFECT,
      payload: control,
    });

    expect(newState).toEqual(expectedState);
  });
});
