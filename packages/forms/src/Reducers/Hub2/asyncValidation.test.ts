import cloneDeep from 'lodash.clonedeep';
import { asyncValidation } from './asyncValidation';
import { buildControlState } from '../../Helpers/buildControlState';
import { config, emergencyContactConfigs } from '../../Testing/config';
import { FormGroup, FormArray, AbstractControl } from '../../Models/Controls';
import { FormArrayConfig, FormGroupConfig } from '../../Models/Configs';
import { Contact } from '../../Testing/Models/Contact';
import { EmergencyContact } from '../../Testing/Models/EmergencyContact';
import { FORMS_ASYNC_VALIDATE_CONTROL } from '../../Actions/Hub2/valueChange';
import { getControl } from '../../Helpers/getControl';
import { formChange } from './formChange';
import { formChange as formChangeAction } from '../../Actions/Hub2/formChange';

describe('asyncValidation', () => {
  it('should update validation', () => {
    const clonedConfig: FormGroupConfig = cloneDeep(config);
    (<FormArrayConfig>clonedConfig.controls.emergencyContacts).controls =
      emergencyContactConfigs;
    const initialBaseState = buildControlState(
      clonedConfig,
    ) as FormGroup<Contact>;

    const initialState = formChange(
      null,
      formChangeAction(initialBaseState),
    ) as FormGroup<Contact>;

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
    const control = getControl(
      controlRef,
      initialState,
    ) as AbstractControl<unknown>;

    const newState = asyncValidation(initialState, {
      type: FORMS_ASYNC_VALIDATE_CONTROL,
      payload: control,
    });

    expect(newState).toEqual(expectedState);
  });
});
