import { updateValues } from './updateValues';
import { syncValidate } from './syncValidate';
import { buildControlState } from '../../Helpers/buildControlState';
import { config, emergencyContactConfigs } from '../../Testing/config';
import { FORMS_CONTROL_CHANGE } from '../../Actions/Hub1/controlChange';
import { BaseGroupControl, BaseArrayControl } from '../../Models/Controls';
import { FormArrayConfig, FormGroupConfig } from '../../Models/Configs';
import { Contact } from '../../Testing/Models/Contact';
import { EmergencyContact } from '../../Testing/Models/EmergencyContact';
import { DoctorInfo } from '../../Testing/Models/DoctorInfo';

describe('syncValidate', () => {
  it('should verify intitial state is not valid', () => {
    const initialState = buildControlState(config) as BaseGroupControl<Contact>;
    expect(syncValidate(initialState)).toEqual(initialState);
  });

  it('should validate only for a FormControl in a FormGroup', () => {
    const initialState = buildControlState(config) as BaseGroupControl<Contact>;
    const valuesUpdatedState = updateValues(initialState, {
      type: FORMS_CONTROL_CHANGE,
      payload: {
        controlRef: ['firstName'],
        value: 'Homer',
      },
    }) as BaseGroupControl<Contact>;

    expect(syncValidate(valuesUpdatedState)).toEqual({
      ...valuesUpdatedState,
      validatorErrors: {
        firstNameNotSameAsLast: false,
      },
      validatorsValid: false,
      controls: {
        ...valuesUpdatedState.controls,
        firstName: {
          ...initialState.controls.firstName,
          value: 'Homer',
          validatorsValid: true,
          validatorErrors: {
            required: false,
          },
        },
      },
    });
  });

  it('should validate only for a FormGroup in a FormGroup', () => {
    const initialState = buildControlState(config) as BaseGroupControl<Contact>;
    const valuesUpdatedState = updateValues(initialState, {
      type: FORMS_CONTROL_CHANGE,
      payload: {
        controlRef: ['doctorInfo', 'firstName'],
        value: 'Dr First Name',
      },
    }) as BaseGroupControl<Contact>;
    expect(syncValidate(valuesUpdatedState)).toEqual({
      ...valuesUpdatedState,
      controls: {
        ...valuesUpdatedState.controls,
        doctorInfo: {
          ...valuesUpdatedState.controls.doctorInfo,
          validatorErrors: {
            firstNameNotSameAsLast: false,
          },
          validatorsValid: false,
          controls: {
            ...(<BaseGroupControl<DoctorInfo>>(
              valuesUpdatedState.controls.doctorInfo
            )).controls,
            firstName: {
              ...(<BaseGroupControl<DoctorInfo>>(
                initialState.controls.doctorInfo
              )).controls.firstName,
              value: 'Dr First Name',
              validatorsValid: true,
              validatorErrors: {
                required: false,
              },
            },
          },
        },
      },
    });
  });

  it('should validate only for a FormArray in a FormGroup', () => {
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
        value: 'syzlak',
      },
    }) as BaseGroupControl<Contact>;

    expect(syncValidate(valuesUpdatedState)).toEqual({
      ...valuesUpdatedState,
      controls: {
        ...valuesUpdatedState.controls,
        emergencyContacts: {
          ...valuesUpdatedState.controls.emergencyContacts,
          validatorsValid: false,
          controls: [
            (<BaseArrayControl<EmergencyContact>>(
              valuesUpdatedState.controls.emergencyContacts
            )).controls[0],
            {
              ...((<BaseArrayControl<EmergencyContact>>(
                valuesUpdatedState.controls.emergencyContacts
              )).controls[1] as BaseGroupControl<EmergencyContact>),
              validatorsValid: false,
              validatorErrors: {
                firstNameNotSameAsLast: true,
              },
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
                },
              },
            },
          ],
        },
      },
    });
  });
});
