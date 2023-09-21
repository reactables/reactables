import cloneDeep from 'lodash.clonedeep';
import { addFormArrayControl } from './addFormArrayControl';
import { buildControlState } from '../Helpers/buildControlState';
import {
  config,
  emergencyContactConfigs,
  firstNameNotSameAsLast,
} from '../Testing/config';
import { FormGroup, FormArray } from '../Models/Controls';
import { FORMS_ADD_FORM_ARRAY_CONTROL } from '../Actions/addArrayControl';
import {
  FormArrayConfig,
  FormGroupConfig,
  FormControlConfig,
} from '../Models/Configs';
import { Contact } from '../Testing/Models/Contact';
import { required, email } from '../Validators/Validators';
import {
  uniqueEmail,
  uniqueFirstAndLastName,
  blacklistedEmail,
} from '../Testing/AsyncValidators';

describe('addFormArrayControl', () => {
  it('should add a form control to formArray', () => {
    const initialValue = [
      {
        firstName: 'Homer',
        lastName: 'Simpson',
        email: 'homer@homer.com',
        relation: 'friend',
      },
      {
        firstName: 'moe',
        lastName: 'syzlak',
        email: 'moe@moe.com',
        relation: 'friend',
      },
    ];
    const clonedConfig: FormGroupConfig = cloneDeep(config);
    (<FormArrayConfig>clonedConfig.controls.emergencyContacts).controls =
      emergencyContactConfigs;
    const initialState = buildControlState(clonedConfig) as FormGroup<Contact>;

    const newControlConfig: FormGroupConfig = {
      validators: [firstNameNotSameAsLast],
      asyncValidators: [uniqueFirstAndLastName],
      controls: {
        firstName: {
          initialValue: 'Barney',
          validators: [required],
        } as FormControlConfig<string>,
        lastName: {
          initialValue: 'Gumble',
          validators: [required],
        } as FormControlConfig<string>,
        email: {
          initialValue: 'barney@gumble.com',
          validators: [required, email],
          asyncValidators: [uniqueEmail, blacklistedEmail],
        } as FormControlConfig<string>,
        relation: {
          initialValue: 'astronaut friend',
          validators: [required],
        } as FormControlConfig<string>,
      },
    };

    const newState = addFormArrayControl(initialState, {
      type: FORMS_ADD_FORM_ARRAY_CONTROL,
      payload: {
        config: newControlConfig,
        controlRef: ['emergencyContacts'],
      },
    }) as FormGroup<Contact>;

    const newControl = buildControlState(newControlConfig, [
      'emergencyContacts',
      2,
    ]);

    const expectedState = cloneDeep(initialState);
    expectedState.value.emergencyContacts = [
      ...initialValue,
      {
        firstName: 'Barney',
        lastName: 'Gumble',
        email: 'barney@gumble.com',
        relation: 'astronaut friend',
      },
    ];

    const emergencyContactsControl = expectedState.controls
      .emergencyContacts as FormArray<unknown>;

    emergencyContactsControl.value = [
      ...initialValue,
      {
        firstName: 'Barney',
        lastName: 'Gumble',
        email: 'barney@gumble.com',
        relation: 'astronaut friend',
      },
    ];

    emergencyContactsControl.controls = [
      ...emergencyContactsControl.controls,
      newControl,
    ];

    expect(newState).toEqual(expectedState);
  });
});
