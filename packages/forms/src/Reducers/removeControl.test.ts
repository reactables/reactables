import cloneDeep from 'lodash.clonedeep';
import { removeControl } from './removeControl';
import { buildControlState } from '../Helpers/buildControlState';
import { config, emergencyContactConfigs } from '../Testing/config';
import { BaseGroupControl, BaseArrayControl } from '../Models/Controls';
import {
  FormArrayConfig,
  FormGroupConfig,
  FormControlConfig,
} from '../Models/Configs';
import { FORMS_REMOVE_CONTROL } from '../Actions/removeControl';
import { Contact } from '../Testing/Models/Contact';
import { EmergencyContact } from '../Testing/Models/EmergencyContact';
import { DoctorInfo } from '../Testing/Models/DoctorInfo';

describe('removeControl', () => {
  it('should remove a formGroup control', () => {
    const configWithType: FormGroupConfig = cloneDeep(config);

    (<FormGroupConfig>configWithType.controls.doctorInfo).controls.type = {
      initialValue: 'test',
    } as FormControlConfig<string>;

    const initialState = buildControlState(
      configWithType,
    ) as BaseGroupControl<Contact>;

    const controlRef = ['doctorInfo', 'type'];
    const newState = removeControl(initialState, {
      type: FORMS_REMOVE_CONTROL,
      payload: controlRef,
    }) as BaseGroupControl<Contact>;

    const expectedState = cloneDeep(initialState);
    delete (<BaseGroupControl<DoctorInfo>>expectedState.controls.doctorInfo)
      .controls.type;
    expectedState.controls.doctorInfo.value = {
      ...(<BaseGroupControl<DoctorInfo>>expectedState.controls.doctorInfo)
        .value,
      type: undefined,
    };

    expectedState.value = {
      ...expectedState.value,
      doctorInfo: {
        ...(<BaseGroupControl<DoctorInfo>>expectedState.controls.doctorInfo)
          .value,
        type: undefined,
      },
    };

    expect(newState).toEqual(expectedState);
  });

  it('should remove an array control item', () => {
    const clonedConfig: FormGroupConfig = cloneDeep(config);
    (<FormArrayConfig>clonedConfig.controls.emergencyContacts).controls =
      emergencyContactConfigs;
    const initialState = buildControlState(
      clonedConfig,
    ) as BaseGroupControl<Contact>;

    const controlRef = ['emergencyContacts', 0];

    const newState = removeControl(initialState, {
      type: FORMS_REMOVE_CONTROL,
      payload: controlRef,
    });

    const expectedState: BaseGroupControl<Contact> = cloneDeep(initialState);
    const emergencyContacts = <BaseArrayControl<EmergencyContact[]>>(
      expectedState.controls.emergencyContacts
    );
    expectedState.value = {
      ...expectedState.value,
      emergencyContacts: [
        {
          firstName: 'moe',
          lastName: 'syzlak',
          email: 'moe@moe.com',
          relation: 'friend',
        },
      ],
    };
    emergencyContacts.controls = [
      {
        ...emergencyContacts.controls[1],
        controlRef: ['emergencyContacts', 0],
        controls: {
          firstName: {
            ...(<BaseGroupControl<EmergencyContact>>(
              emergencyContacts.controls[1]
            )).controls.firstName,
            controlRef: ['emergencyContacts', 0, 'firstName'],
          },
          lastName: {
            ...(<BaseGroupControl<EmergencyContact>>(
              emergencyContacts.controls[1]
            )).controls.lastName,
            controlRef: ['emergencyContacts', 0, 'lastName'],
          },
          email: {
            ...(<BaseGroupControl<EmergencyContact>>(
              emergencyContacts.controls[1]
            )).controls.email,
            controlRef: ['emergencyContacts', 0, 'email'],
          },
          relation: {
            ...(<BaseGroupControl<EmergencyContact>>(
              emergencyContacts.controls[1]
            )).controls.relation,
            controlRef: ['emergencyContacts', 0, 'relation'],
          },
        },
      } as BaseGroupControl<EmergencyContact>,
    ];
    emergencyContacts.value = [
      {
        firstName: 'moe',
        lastName: 'syzlak',
        email: 'moe@moe.com',
        relation: 'friend',
      },
    ];

    expect(newState).toEqual(expectedState);
  });
});
