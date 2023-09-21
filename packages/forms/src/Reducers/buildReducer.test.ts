import { buildReducer } from './buildReducer';
import cloneDeep from 'lodash.clonedeep';
import { buildControlState } from '../Helpers/buildControlState';
import { config, emergencyContactConfigs } from '../Testing/config';
import { FORMS_CONTROL_CHANGE } from '../Actions/controlChange';
import { FORMS_RESET_CONTROL } from '../Actions/resetControl';
import { FormGroup, FormArray } from '../Models/Controls';
import { FormArrayConfig, FormGroupConfig } from '../Models/Configs';
import { Contact } from '../Testing/Models/Contact';
import { EmergencyContact } from '../Testing/Models/EmergencyContact';
import { Reducer } from '@hubfx/core';

describe('buildReducer', () => {
  describe('reacting to change control', () => {
    const formsReducer = buildReducer(config) as Reducer<FormGroup<Contact>>;
    const initialState = formsReducer();

    it('should react to FORMS_CONTROL_CHANGE for a FC -> FG', () => {
      expect(
        formsReducer(initialState, {
          type: FORMS_CONTROL_CHANGE,
          payload: {
            value: 'Homer',
            controlRef: ['firstName'],
          },
        }),
      ).toEqual({
        ...initialState,
        errors: {
          firstNameNotSameAsLast: false,
        },
        dirty: true,
        value: {
          firstName: 'Homer',
          lastName: '',
          email: '',
          phone: '',
          emergencyContacts: [],
          doctorInfo: {
            firstName: '',
            lastName: '',
            email: '',
          },
        },
        controls: {
          ...initialState.controls,
          firstName: {
            ...initialState.controls.firstName,
            controlRef: ['firstName'],
            value: 'Homer',
            dirty: true,
            touched: false,
            valid: true,
            errors: {
              required: false,
            },
            asyncValidateInProgress: {},
            pending: false,
          },
        },
      });
    });

    it('should react to a FORMS_CONTROL_CHANGE FG -> FA -> FG', () => {
      const clonedConfig: FormGroupConfig = cloneDeep(config);
      (<FormArrayConfig>clonedConfig.controls.emergencyContacts).controls =
        emergencyContactConfigs;

      const initialState = buildControlState(
        clonedConfig,
      ) as FormGroup<Contact>;

      const newValue = {
        firstName: 'Moe changed',
        lastName: 'Syzlak changed',
        email: 'moe@changed.com',
        relation: 'friend changed',
      };
      const expectedNewState = cloneDeep(initialState);

      expectedNewState.value.emergencyContacts[1] = newValue;
      expectedNewState.dirty = true;
      expectedNewState.controls.emergencyContacts.value = [
        initialState.controls.emergencyContacts.value[0],
        newValue,
      ];

      const emergencyContactsControl = expectedNewState.controls
        .emergencyContacts as FormArray<unknown>;
      const emergencyContactControls1 = emergencyContactsControl
        .controls[1] as FormGroup<EmergencyContact>;
      emergencyContactsControl.dirty = true;
      emergencyContactControls1.value = newValue;
      emergencyContactControls1.dirty = true;

      emergencyContactControls1.controls.firstName.value = newValue.firstName;
      emergencyContactControls1.controls.firstName.dirty = true;
      emergencyContactControls1.controls.lastName.value = newValue.lastName;
      emergencyContactControls1.controls.lastName.dirty = true;
      emergencyContactControls1.controls.email.value = newValue.email;
      emergencyContactControls1.controls.email.dirty = true;
      emergencyContactControls1.controls.relation.value = newValue.relation;
      emergencyContactControls1.controls.relation.dirty = true;

      const newState = formsReducer(initialState, {
        type: FORMS_CONTROL_CHANGE,
        payload: {
          value: newValue,
          controlRef: ['emergencyContacts', 1],
        },
      });

      expect(newState).toEqual(expectedNewState);
    });
  });

  describe('when resetting form', () => {
    let clonedConfig: FormGroupConfig;
    let initialState: FormGroup<Contact>;
    let formsReducer: Reducer<FormGroup<Contact>>;
    const newValue = {
      firstName: 'Moe changed',
      lastName: 'Syzlak changed',
      email: 'moe@changed.com',
      relation: 'friend changed',
    };

    beforeEach(() => {
      clonedConfig = cloneDeep(config);
      (<FormArrayConfig>clonedConfig.controls.emergencyContacts).controls =
        emergencyContactConfigs;

      formsReducer = buildReducer(clonedConfig) as Reducer<FormGroup<Contact>>;
      initialState = formsReducer();
    });

    it('should reset entire form', () => {
      const changedState = formsReducer(initialState, {
        type: FORMS_CONTROL_CHANGE,
        payload: {
          value: newValue,
          controlRef: ['emergencyContacts', 1],
        },
      });
      const stateReset = formsReducer(changedState, {
        type: FORMS_RESET_CONTROL,
        payload: [],
      });

      expect(stateReset).toEqual(initialState);
    });

    it('should reset a control and update ancestor values', () => {
      const changedState = formsReducer(initialState, {
        type: FORMS_CONTROL_CHANGE,
        payload: {
          value: newValue,
          controlRef: ['emergencyContacts', 1],
        },
      });
      const stateReset = formsReducer(changedState, {
        type: FORMS_RESET_CONTROL,
        payload: ['emergencyContacts', 1],
      });
      const expectedState = cloneDeep(changedState);
      expectedState.dirty = false;
      expectedState.value = initialState.value;
      expectedState.controls.emergencyContacts.value =
        initialState.controls.emergencyContacts.value;
      expectedState.controls.emergencyContacts.dirty = false;

      (<FormArray<unknown>>(
        expectedState.controls.emergencyContacts
      )).controls[1] = (<FormArray<unknown>>(
        initialState.controls.emergencyContacts
      )).controls[1];

      expect(stateReset).toEqual(expectedState);
    });
  });
});
