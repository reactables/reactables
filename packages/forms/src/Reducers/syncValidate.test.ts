import { updateValues } from './updateValues';
import { syncValidate } from './syncValidate';
import { buildControlState } from '../Helpers/buildControlState';
import { config, emergencyContactConfigs } from '../Testing/config';
import { FORMS_CONTROL_CHANGE } from '../Actions/controlChange';
import { FormGroup, FormArray } from '../Models/Controls';
import { FormArrayConfig, FormGroupConfig } from '../Models/Configs';
import { Contact } from '../Testing/Models/Contact';
import { EmergencyContact } from '../Testing/Models/EmergencyContact';
import { DoctorInfo } from '../Testing/Models/DoctorInfo';

describe('syncValidate', () => {
  it('should verify intitial state is not valid', () => {
    const initialState = buildControlState(config) as FormGroup<Contact>;
    expect(syncValidate(initialState)).toEqual(initialState);
  });

  it('should validate only for a FormControl in a FormGroup', () => {
    const initialState = buildControlState(config) as FormGroup<Contact>;
    const valuesUpdatedState = updateValues(initialState, {
      type: FORMS_CONTROL_CHANGE,
      payload: {
        controlRef: ['firstName'],
        value: 'Homer',
      },
    }) as FormGroup<Contact>;
    expect(syncValidate(valuesUpdatedState)).toEqual({
      ...valuesUpdatedState,
      errors: {
        firstNameNotSameAsLast: false,
      },
      controls: {
        ...valuesUpdatedState.controls,
        firstName: {
          ...initialState.controls.firstName,
          value: 'Homer',
          valid: true,
          errors: {
            required: false,
          },
        },
      },
    });
  });

  it('should validate only for a FormGroup in a FormGroup', () => {
    const initialState = buildControlState(config) as FormGroup<Contact>;
    const valuesUpdatedState = updateValues(initialState, {
      type: FORMS_CONTROL_CHANGE,
      payload: {
        controlRef: ['doctorInfo', 'firstName'],
        value: 'Dr First Name',
      },
    }) as FormGroup<Contact>;
    expect(syncValidate(valuesUpdatedState)).toEqual({
      ...valuesUpdatedState,
      controls: {
        ...valuesUpdatedState.controls,
        doctorInfo: {
          ...valuesUpdatedState.controls.doctorInfo,
          errors: {
            firstNameNotSameAsLast: false,
          },
          controls: {
            ...(<FormGroup<DoctorInfo>>valuesUpdatedState.controls.doctorInfo)
              .controls,
            firstName: {
              ...(<FormGroup<DoctorInfo>>initialState.controls.doctorInfo)
                .controls.firstName,
              value: 'Dr First Name',
              valid: true,
              errors: {
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
    ) as FormGroup<Contact>;

    const valuesUpdatedState = updateValues(initialState, {
      type: FORMS_CONTROL_CHANGE,
      payload: {
        controlRef: ['emergencyContacts', 1, 'firstName'],
        value: 'syzlak',
      },
    }) as FormGroup<Contact>;

    expect(syncValidate(valuesUpdatedState)).toEqual({
      ...valuesUpdatedState,
      controls: {
        ...valuesUpdatedState.controls,
        emergencyContacts: {
          ...valuesUpdatedState.controls.emergencyContacts,
          valid: false,
          controls: [
            (<FormArray<EmergencyContact>>(
              valuesUpdatedState.controls.emergencyContacts
            )).controls[0],
            {
              ...((<FormArray<EmergencyContact>>(
                valuesUpdatedState.controls.emergencyContacts
              )).controls[1] as FormGroup<EmergencyContact>),
              valid: false,
              errors: {
                firstNameNotSameAsLast: true,
              },
              controls: {
                ...(
                  (<FormArray<EmergencyContact>>(
                    valuesUpdatedState.controls.emergencyContacts
                  )).controls[1] as FormGroup<EmergencyContact>
                ).controls,
                firstName: {
                  ...(
                    (<FormArray<EmergencyContact>>(
                      valuesUpdatedState.controls.emergencyContacts
                    )).controls[1] as FormGroup<EmergencyContact>
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
