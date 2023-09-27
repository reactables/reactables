import { updateDirty } from './updateDirty';
import { updateValues } from './updateValues';
import { buildControlState } from '../Helpers/buildControlState';
import { config, emergencyContactConfigs } from '../Testing/config';
import { FORMS_CONTROL_CHANGE } from '../Actions/controlChange';
import { BaseGroupControl, BaseArrayControl } from '../Models/Controls';
import { FormArrayConfig, FormGroupConfig } from '../Models/Configs';
import { Contact } from '../Testing/Models/Contact';
import { EmergencyContact } from '../Testing/Models/EmergencyContact';
import { DoctorInfo } from '../Testing/Models/DoctorInfo';

describe('updateDirty', () => {
  it('should verify intitial state is not dirty', () => {
    const initialState = buildControlState(config) as BaseGroupControl<Contact>;
    expect(updateDirty(initialState)).toEqual(initialState);
  });

  it('should update dirty only for a FormControl in a FormGroup', () => {
    const initialState = buildControlState(config) as BaseGroupControl<Contact>;
    const valuesUpdatedState = updateValues(initialState, {
      type: FORMS_CONTROL_CHANGE,
      payload: {
        controlRef: ['firstName'],
        value: 'Homer',
      },
    }) as BaseGroupControl<Contact>;
    expect(updateDirty(valuesUpdatedState)).toEqual({
      ...valuesUpdatedState,
      dirty: true,
      controls: {
        ...valuesUpdatedState.controls,
        firstName: {
          ...initialState.controls.firstName,
          value: 'Homer',
          dirty: true,
        },
      },
    });
  });

  it('should update dirty only for a FormGroup in a FormGroup', () => {
    const initialState = buildControlState(config) as BaseGroupControl<Contact>;
    const valuesUpdatedState = updateValues(initialState, {
      type: FORMS_CONTROL_CHANGE,
      payload: {
        controlRef: ['doctorInfo', 'firstName'],
        value: 'Dr First Name',
      },
    }) as BaseGroupControl<Contact>;
    expect(updateDirty(valuesUpdatedState)).toEqual({
      ...valuesUpdatedState,
      dirty: true,
      controls: {
        ...valuesUpdatedState.controls,
        doctorInfo: {
          ...valuesUpdatedState.controls.doctorInfo,
          dirty: true,
          controls: {
            ...(<BaseGroupControl<DoctorInfo>>(
              valuesUpdatedState.controls.doctorInfo
            )).controls,
            firstName: {
              ...(<BaseGroupControl<DoctorInfo>>(
                valuesUpdatedState.controls.doctorInfo
              )).controls.firstName,
              value: 'Dr First Name',
              dirty: true,
            },
          },
        },
      },
    });
  });

  it('should update dirty only for a FormArray in a FormGroup', () => {
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

    const initialState = buildControlState(
      nonEmptyConfig,
    ) as BaseGroupControl<Contact>;

    const valuesUpdatedState = updateValues(initialState, {
      type: FORMS_CONTROL_CHANGE,
      payload: {
        controlRef: ['emergencyContacts', 1, 'firstName'],
        value: 'Moe Flaming',
      },
    }) as BaseGroupControl<Contact>;

    expect(updateDirty(valuesUpdatedState)).toEqual({
      ...valuesUpdatedState,
      dirty: true,
      controls: {
        ...valuesUpdatedState.controls,
        emergencyContacts: {
          ...valuesUpdatedState.controls.emergencyContacts,
          dirty: true,
          controls: [
            (<BaseArrayControl<EmergencyContact>>(
              valuesUpdatedState.controls.emergencyContacts
            )).controls[0],
            {
              ...((<BaseArrayControl<EmergencyContact>>(
                valuesUpdatedState.controls.emergencyContacts
              )).controls[1] as BaseGroupControl<EmergencyContact>),
              dirty: true,
              controls: {
                ...(
                  (<BaseArrayControl<EmergencyContact>>(
                    valuesUpdatedState.controls.emergencyContacts
                  )).controls[1] as BaseGroupControl<EmergencyContact>
                ).controls,
                firstName: {
                  ...(
                    (<BaseArrayControl<EmergencyContact>>(
                      valuesUpdatedState.controls.emergencyContacts
                    )).controls[1] as BaseGroupControl<EmergencyContact>
                  ).controls.firstName,
                  dirty: true,
                },
              },
            },
          ],
        },
      },
    });
  });
});
