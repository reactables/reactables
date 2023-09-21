import { updateValues } from './updateValues';
import cloneDeep from 'lodash.clonedeep';
import { buildControlState } from '../Helpers/buildControlState';
import { config, emergencyContactConfigs } from '../Testing/config';
import { FORMS_CONTROL_CHANGE } from '../Actions/controlChange';
import { FormGroup, FormArray } from '../Models/Controls';
import { FormArrayConfig, FormGroupConfig } from '../Models/Configs';
import { Contact } from '../Testing/Models/Contact';
import { EmergencyContact } from '../Testing/Models/EmergencyContact';
import { DoctorInfo } from '../Testing/Models/DoctorInfo';

describe('updateValues', () => {
  it('should update values only for a FC -> FG', () => {
    const initialState = buildControlState(config) as FormGroup<Contact>;
    const expectedState = {
      ...initialState,
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
          value: 'Homer',
        },
      },
    };

    const result = updateValues(initialState, {
      type: FORMS_CONTROL_CHANGE,
      payload: {
        controlRef: ['firstName'],
        value: 'Homer',
      },
    });

    expect(result).toEqual(expectedState);
  });

  it('should update values only for a FC -> FG -> FG', () => {
    const initialState = buildControlState(config) as FormGroup<Contact>;
    expect(
      updateValues(initialState, {
        type: FORMS_CONTROL_CHANGE,
        payload: {
          controlRef: ['doctorInfo', 'firstName'],
          value: 'Dr First Name',
        },
      }),
    ).toEqual({
      ...initialState,
      value: {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        emergencyContacts: [],
        doctorInfo: {
          firstName: 'Dr First Name',
          lastName: '',
          email: '',
        },
      },
      controls: {
        ...initialState.controls,
        doctorInfo: {
          ...initialState.controls.doctorInfo,
          value: {
            firstName: 'Dr First Name',
            lastName: '',
            email: '',
          },
          controls: {
            ...(<FormGroup<DoctorInfo>>initialState.controls.doctorInfo)
              .controls,
            firstName: {
              ...(<FormGroup<DoctorInfo>>initialState.controls.doctorInfo)
                .controls.firstName,
              value: 'Dr First Name',
            },
          },
        },
      },
    });
  });

  it('should update values only for a FC -> FG -> FA -> FG ', () => {
    const emergencyContactsConfig = {
      ...(config.controls.emergencyContacts as FormArrayConfig),
      controls: emergencyContactConfigs,
    };

    const nonEmptyConfig: FormGroupConfig = {
      ...config,
      controls: {
        ...config.controls,
        emergencyContacts: emergencyContactsConfig,
      },
    };
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

    const initialState = buildControlState(
      nonEmptyConfig,
    ) as FormGroup<Contact>;

    expect(
      updateValues(initialState, {
        type: FORMS_CONTROL_CHANGE,
        payload: {
          controlRef: ['emergencyContacts', 1, 'firstName'],
          value: 'Moe Flaming',
        },
      }),
    ).toEqual({
      ...initialState,
      value: {
        ...initialState.value,
        emergencyContacts: [
          initialValue[0],
          {
            ...initialValue[1],
            firstName: 'Moe Flaming',
          },
        ],
      },
      controls: {
        ...initialState.controls,
        emergencyContacts: {
          ...initialState.controls.emergencyContacts,
          value: [
            initialValue[0],
            {
              ...initialValue[1],
              firstName: 'Moe Flaming',
            },
          ],
          controls: [
            (<FormArray<EmergencyContact>>(
              initialState.controls.emergencyContacts
            )).controls[0],
            {
              ...((<FormArray<EmergencyContact>>(
                initialState.controls.emergencyContacts
              )).controls[1] as FormGroup<EmergencyContact>),
              value: {
                ...initialValue[1],
                firstName: 'Moe Flaming',
              },
              controls: {
                ...(
                  (<FormArray<EmergencyContact>>(
                    initialState.controls.emergencyContacts
                  )).controls[1] as FormGroup<EmergencyContact>
                ).controls,
                firstName: {
                  ...(
                    (<FormArray<EmergencyContact>>(
                      initialState.controls.emergencyContacts
                    )).controls[1] as FormGroup<EmergencyContact>
                  ).controls.firstName,
                  value: 'Moe Flaming',
                },
              },
            },
          ],
        },
      },
    });
  });

  it('should update values only for a FG -> FG', () => {
    const newDoctorValue = {
      firstName: 'Dr',
      lastName: 'Ho',
      email: 'dr@hoe.com',
    };
    const state = buildControlState(config) as FormGroup<Contact>;
    const expectedState = cloneDeep(state);
    expectedState.value = {
      ...expectedState.value,
      doctorInfo: newDoctorValue,
    };
    const doctorInfoControl = expectedState.controls
      .doctorInfo as FormGroup<DoctorInfo>;
    doctorInfoControl.value = newDoctorValue;
    doctorInfoControl.controls.firstName.value = newDoctorValue.firstName;
    doctorInfoControl.controls.lastName.value = newDoctorValue.lastName;
    doctorInfoControl.controls.email.value = newDoctorValue.email;

    const newState = updateValues(state, {
      type: FORMS_CONTROL_CHANGE,
      payload: {
        controlRef: ['doctorInfo'],
        value: {
          firstName: 'Dr',
          lastName: 'Ho',
          email: 'dr@hoe.com',
        },
      },
    });

    expect(newState).toEqual(expectedState);
  });

  it('should update values only for a FA -> FG', () => {
    const clonedConfig: FormGroupConfig = cloneDeep(config);
    (<FormArrayConfig>clonedConfig.controls.emergencyContacts).controls =
      emergencyContactConfigs;

    const initialState = buildControlState(clonedConfig) as FormGroup<Contact>;
    const newValue: EmergencyContact[] = [
      {
        firstName: 'Milhouse',
        lastName: 'Vanhoutten',
        email: 'thrill@house.com',
        relation: 'friend',
      },
      {
        firstName: 'James',
        lastName: 'Woods',
        email: 'james@woods.com',
        relation: 'cashier',
      },
    ];

    const expectedState = cloneDeep(initialState);

    expectedState.value.emergencyContacts = newValue;
    expectedState.controls.emergencyContacts.value = newValue;

    const emergencyContactControls = expectedState.controls
      .emergencyContacts as FormArray<unknown>;

    const emergencyContactControls0 = emergencyContactControls
      .controls[0] as FormGroup<EmergencyContact>;
    const emergencyContactControls1 = emergencyContactControls
      .controls[1] as FormGroup<EmergencyContact>;

    emergencyContactControls0.value = newValue[0];
    emergencyContactControls0.controls.firstName.value = newValue[0].firstName;
    emergencyContactControls0.controls.lastName.value = newValue[0].lastName;
    emergencyContactControls0.controls.email.value = newValue[0].email;
    emergencyContactControls0.controls.relation.value = newValue[0].relation;
    emergencyContactControls1.value = newValue[1];
    emergencyContactControls1.controls.firstName.value = newValue[1].firstName;
    emergencyContactControls1.controls.lastName.value = newValue[1].lastName;
    emergencyContactControls1.controls.email.value = newValue[1].email;
    emergencyContactControls1.controls.relation.value = newValue[1].relation;

    const newState = updateValues(initialState, {
      type: FORMS_CONTROL_CHANGE,
      payload: {
        controlRef: ['emergencyContacts'],
        value: newValue,
      },
    });

    expect(newState).toEqual(expectedState);
  });

  it('should throw an error if trying to update a FG key that does not exist', () => {
    const newDoctorValue = {
      firstName: 'Dr',
      lastName: 'Ho',
      email: 'dr@hoe.com',
      xyz: 'not here',
    };
    const state = buildControlState(config);

    const newStateFunc = () =>
      updateValues(state, {
        type: FORMS_CONTROL_CHANGE,
        payload: {
          controlRef: ['doctorInfo'],
          value: newDoctorValue,
        },
      });

    expect(newStateFunc).toThrowError(
      `The number of keys do not match form group: doctorInfo`,
    );
  });

  it('should throw an error if trying to update a FA index that does not exist', () => {
    const clonedConfig: FormGroupConfig = cloneDeep(config);
    (<FormArrayConfig>clonedConfig.controls.emergencyContacts).controls =
      emergencyContactConfigs;
    const state = buildControlState(clonedConfig);

    const newStateFunc = () =>
      updateValues(state, {
        type: FORMS_CONTROL_CHANGE,
        payload: {
          controlRef: ['emergencyContacts'],
          value: [
            {
              firstName: '',
              lastName: '',
              email: '',
              relation: '',
            },
          ],
        },
      });

    expect(newStateFunc).toThrowError(
      `The number of value items does not match the number of controls in array: emergencyContacts`,
    );
  });
});
