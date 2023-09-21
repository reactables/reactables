import {
  config,
  emergencyContactConfigs,
  firstNameNotSameAsLast,
} from '../Testing/config';
import { Contact } from '../Testing/Models/Contact';
import { DoctorInfo } from '../Testing/Models/DoctorInfo';
import { FormControl, FormArray, FormGroup } from '../Models/Controls';
import {
  FormArrayConfig,
  FormControlConfig,
  FormGroupConfig,
} from '../Models/Configs';
import { required, email } from '../Validators/Validators';
import { uniqueEmail, blacklistedEmail } from '../Testing/AsyncValidators';
import { buildControlState } from './buildControlState';

describe('buildControlState', () => {
  const BASE_FORM_CONTROL = {
    dirty: false,
    touched: false,
    asyncValidateInProgress: {},
    pending: false,
  };

  it('should build the control state for for type field', () => {
    const expectedControl = {
      ...BASE_FORM_CONTROL,
      controlRef: ['firstName'],
      value: '',
      valid: false,
      errors: {
        required: true,
      },
      config: config.controls.firstName,
    } as FormControl<string>;
    expect(buildControlState(config.controls.firstName, ['firstName'])).toEqual(
      {
        pristineControl: expectedControl,
        ...expectedControl,
      },
    );
  });

  it('should build the control state for type group with empty value', () => {
    const initialValue = {
      firstName: '',
      lastName: '',
      email: '',
    };

    const expectedFirstNameControl = {
      ...BASE_FORM_CONTROL,
      controlRef: ['doctorInfo', 'firstName'],
      valid: false,
      errors: {
        required: true,
      },
      value: '',
      config: (<FormGroupConfig>config.controls.doctorInfo).controls.firstName,
    };
    const expectedLastNameControl = {
      ...BASE_FORM_CONTROL,
      controlRef: ['doctorInfo', 'lastName'],
      valid: false,
      errors: {
        required: true,
      },
      value: '',
      config: (<FormGroupConfig>config.controls.doctorInfo).controls.lastName,
    };
    const expectedEmailControl = {
      ...BASE_FORM_CONTROL,
      controlRef: ['doctorInfo', 'email'],
      valid: false,
      errors: {
        email: false,
        required: true,
      },
      value: '',
      config: (<FormGroupConfig>config.controls.doctorInfo).controls.email,
    };
    const expectedControl: FormGroup<DoctorInfo> = {
      ...BASE_FORM_CONTROL,
      controlRef: ['doctorInfo'],
      submitting: false,
      valid: false,
      value: initialValue,
      config: config.controls.doctorInfo,
      errors: {
        firstNameNotSameAsLast: true,
      },
      controls: {
        firstName: {
          pristineControl: expectedFirstNameControl,
          ...expectedFirstNameControl,
        },
        lastName: {
          pristineControl: expectedLastNameControl,
          ...expectedLastNameControl,
        },
        email: {
          pristineControl: expectedEmailControl,
          ...expectedEmailControl,
        },
      },
    } as FormGroup<DoctorInfo>;
    expect(
      buildControlState(config.controls.doctorInfo, ['doctorInfo']),
    ).toEqual({
      pristineControl: expectedControl,
      ...expectedControl,
    });
  });

  it('should build the control state for type group with non-empty value', () => {
    const initialValue = {
      firstName: 'Dr',
      lastName: 'Bob',
      email: 'DrBobbob.com',
    };
    const testConfig = {
      validators: [firstNameNotSameAsLast],
      controls: {
        firstName: {
          initialValue: initialValue.firstName,
          validators: [required],
        } as FormControlConfig<string>,
        lastName: {
          initialValue: initialValue.lastName,
          validators: [required],
        } as FormControlConfig<string>,
        email: {
          initialValue: initialValue.email,
          validators: [required, email],
        } as FormControlConfig<string>,
      },
    } as FormGroupConfig;
    const expectedFirstNameControl = {
      ...BASE_FORM_CONTROL,
      controlRef: ['doctorInfo', 'firstName'],
      valid: true,
      errors: {
        required: false,
      },
      value: 'Dr',
      config: testConfig.controls.firstName,
    };
    const expectedLastNameControl = {
      ...BASE_FORM_CONTROL,
      controlRef: ['doctorInfo', 'lastName'],
      valid: true,
      errors: {
        required: false,
      },
      value: 'Bob',
      config: testConfig.controls.lastName,
    };
    const expectedEmailControl = {
      ...BASE_FORM_CONTROL,
      controlRef: ['doctorInfo', 'email'],
      valid: false,
      errors: {
        email: true,
        required: false,
      },
      value: 'DrBobbob.com',
      config: testConfig.controls.email,
    };
    const expectedControl: FormGroup<DoctorInfo> = {
      ...BASE_FORM_CONTROL,
      controlRef: ['doctorInfo'],
      submitting: false,
      valid: false,
      value: initialValue,
      config: testConfig,
      errors: {
        firstNameNotSameAsLast: false,
      },
      controls: {
        firstName: {
          pristineControl: expectedFirstNameControl,
          ...expectedFirstNameControl,
        },
        lastName: {
          pristineControl: expectedLastNameControl,
          ...expectedLastNameControl,
        },
        email: {
          pristineControl: expectedEmailControl,
          ...expectedEmailControl,
        },
      },
    } as FormGroup<DoctorInfo>;
    expect(buildControlState(testConfig, ['doctorInfo'])).toEqual({
      pristineControl: expectedControl,
      ...expectedControl,
    });
  });

  it('should build the control state for for type array with empty initial value', () => {
    const expectedControl = {
      ...BASE_FORM_CONTROL,
      controlRef: ['emergencyContacts'],
      controls: [],
      value: [],
      valid: false,
      config: config.controls.emergencyContacts,
      errors: {
        required: true,
      },
    } as FormArray<unknown>;
    expect(
      buildControlState(config.controls.emergencyContacts, [
        'emergencyContacts',
      ]),
    ).toEqual({
      pristineControl: expectedControl,
      ...expectedControl,
    });
  });

  it('should build the control state for for type array with non-empty form group initial values', () => {
    const nonEmptyConfig = {
      ...(config.controls.emergencyContacts as FormArrayConfig),
      controls: emergencyContactConfigs,
    } as FormArrayConfig;

    const expectedControl0FirstName = {
      ...BASE_FORM_CONTROL,
      controlRef: ['emergencyContacts', 0, 'firstName'],
      valid: true,
      errors: {
        required: false,
      },
      value: 'Homer',
      config: {
        ...emergencyContactConfigs[0].controls.firstName,
        initialValue: 'Homer',
      },
    };

    const expectedControl0LastName = {
      ...BASE_FORM_CONTROL,
      controlRef: ['emergencyContacts', 0, 'lastName'],
      valid: true,
      errors: {
        required: false,
      },
      value: 'Simpson',
      config: {
        ...emergencyContactConfigs[0].controls.lastName,
        initialValue: 'Simpson',
      },
    };

    const expectedControl0Email = {
      ...BASE_FORM_CONTROL,
      controlRef: ['emergencyContacts', 0, 'email'],
      valid: true,
      errors: {
        email: false,
        required: false,
      },
      value: 'homer@homer.com',
      config: {
        ...emergencyContactConfigs[0].controls.email,
        initialValue: 'homer@homer.com',
      },
    };

    const expectedControl0Relation = {
      ...BASE_FORM_CONTROL,
      controlRef: ['emergencyContacts', 0, 'relation'],
      valid: true,
      errors: {
        required: false,
      },
      value: 'friend',
      config: {
        ...emergencyContactConfigs[0].controls.relation,
        initialValue: 'friend',
      },
    };

    const expectedControl0 = {
      ...BASE_FORM_CONTROL,
      controlRef: ['emergencyContacts', 0],
      submitting: false,
      value: {
        firstName: 'Homer',
        lastName: 'Simpson',
        email: 'homer@homer.com',
        relation: 'friend',
      },
      valid: true,
      errors: {
        firstNameNotSameAsLast: false,
      },
      config: emergencyContactConfigs[0],
      controls: {
        firstName: {
          pristineControl: expectedControl0FirstName,
          ...expectedControl0FirstName,
        },
        lastName: {
          pristineControl: expectedControl0LastName,
          ...expectedControl0LastName,
        },
        email: {
          pristineControl: expectedControl0Email,
          ...expectedControl0Email,
        },
        relation: {
          pristineControl: expectedControl0Relation,
          ...expectedControl0Relation,
        },
      } as { [key: string]: FormControl<unknown> },
    } as FormGroup<unknown>;

    const expectedControl1FirstName = {
      ...BASE_FORM_CONTROL,
      controlRef: ['emergencyContacts', 1, 'firstName'],
      valid: true,
      errors: {
        required: false,
      },
      value: 'moe',
      config: {
        ...emergencyContactConfigs[1].controls.firstName,
        initialValue: 'moe',
      },
    };

    const expectedControl1LastName = {
      ...BASE_FORM_CONTROL,
      controlRef: ['emergencyContacts', 1, 'lastName'],
      valid: true,
      errors: {
        required: false,
      },
      value: 'syzlak',
      config: {
        ...emergencyContactConfigs[1].controls.lastName,
        initialValue: 'syzlak',
      },
    };

    const expectedControl1Email = {
      ...BASE_FORM_CONTROL,
      controlRef: ['emergencyContacts', 1, 'email'],
      valid: true,
      errors: {
        email: false,
        required: false,
      },
      value: 'moe@moe.com',
      config: {
        ...emergencyContactConfigs[1].controls.email,
        initialValue: 'moe@moe.com',
      },
    };

    const expectedControl1Relation = {
      ...BASE_FORM_CONTROL,
      controlRef: ['emergencyContacts', 1, 'relation'],
      valid: true,
      errors: {
        required: false,
      },
      value: 'friend',
      config: {
        ...emergencyContactConfigs[1].controls.relation,
        initialValue: 'friend',
      },
    };

    const expectedControl1 = {
      ...BASE_FORM_CONTROL,
      controlRef: ['emergencyContacts', 1],
      submitting: false,
      value: {
        firstName: 'moe',
        lastName: 'syzlak',
        email: 'moe@moe.com',
        relation: 'friend',
      },
      valid: true,
      errors: {
        firstNameNotSameAsLast: false,
      },
      config: {
        ...emergencyContactConfigs[1],
        controls: {
          firstName: {
            initialValue: 'moe',
            validators: [required],
          },
          lastName: {
            initialValue: 'syzlak',
            validators: [required],
          },
          email: {
            initialValue: 'moe@moe.com',
            validators: [required, email],
            asyncValidators: [uniqueEmail, blacklistedEmail],
          },
          relation: { initialValue: 'friend', validators: [required] },
        },
      },
      controls: {
        firstName: {
          pristineControl: expectedControl1FirstName,
          ...expectedControl1FirstName,
        },
        lastName: {
          pristineControl: expectedControl1LastName,
          ...expectedControl1LastName,
        },
        email: {
          pristineControl: expectedControl1Email,
          ...expectedControl1Email,
        },
        relation: {
          pristineControl: expectedControl1Relation,
          ...expectedControl1Relation,
        },
      } as { [key: string]: FormControl<unknown> },
    } as FormGroup<unknown>;

    const expectedControl = {
      config: nonEmptyConfig,
      controls: [
        {
          pristineControl: expectedControl0,
          ...expectedControl0,
        },
        { pristineControl: expectedControl1, ...expectedControl1 },
      ] as FormGroup<unknown>[],
      ...BASE_FORM_CONTROL,
      controlRef: ['emergencyContacts'],
      value: [
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
      ],
      valid: true,
      errors: {
        required: false,
      },
    } as FormArray<unknown>;

    expect(buildControlState(nonEmptyConfig, ['emergencyContacts'])).toEqual({
      pristineControl: expectedControl,
      ...expectedControl,
    });
  });

  it('should build the entire config with empty values', () => {
    const initialValue: Contact = {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      emergencyContacts: [],
      doctorInfo: {
        firstName: '',
        lastName: '',
        email: '',
      },
    };

    const expectedFirstNameControl = {
      ...BASE_FORM_CONTROL,
      controlRef: ['firstName'],
      value: '',
      valid: false,
      errors: {
        required: true,
      },
      config: config.controls.firstName,
    };

    const expectedLastNameControl = {
      ...BASE_FORM_CONTROL,
      controlRef: ['lastName'],
      value: '',
      valid: false,
      errors: {
        required: true,
      },
      config: config.controls.lastName,
    };

    const expectedEmailControl = {
      ...BASE_FORM_CONTROL,
      controlRef: ['email'],
      value: '',
      valid: false,
      errors: {
        email: false,
        required: true,
      },
      config: config.controls.email,
    };

    const expectedPhoneControl = {
      ...BASE_FORM_CONTROL,
      controlRef: ['phone'],
      value: '',
      valid: false,
      errors: {
        required: true,
        phoneNumber: false,
      },
      config: config.controls.phone,
    };

    const expectedEmergencyContactsControl = {
      ...BASE_FORM_CONTROL,
      controlRef: ['emergencyContacts'],
      value: [],
      valid: false,
      errors: {
        required: true,
      },
      config: config.controls.emergencyContacts,
      controls: [],
    };

    const expectedDoctorInfoFirstNameControl = {
      ...BASE_FORM_CONTROL,
      controlRef: ['doctorInfo', 'firstName'],
      value: '',
      valid: false,
      errors: {
        required: true,
      },
      config: (<FormGroupConfig>config.controls.doctorInfo).controls.firstName,
    };

    const expectedDoctorInfoLastNameControl = {
      ...BASE_FORM_CONTROL,
      controlRef: ['doctorInfo', 'lastName'],
      value: '',
      valid: false,
      errors: {
        required: true,
      },
      config: (<FormGroupConfig>config.controls.doctorInfo).controls.lastName,
    };

    const expectedDoctorInfoEmailControl = {
      ...BASE_FORM_CONTROL,
      controlRef: ['doctorInfo', 'email'],
      value: '',
      valid: false,
      errors: {
        email: false,
        required: true,
      },
      config: (<FormGroupConfig>config.controls.doctorInfo).controls.email,
    };

    const expectedDoctorInfoControl = {
      ...BASE_FORM_CONTROL,
      controlRef: ['doctorInfo'],
      submitting: false,
      value: {
        firstName: '',
        lastName: '',
        email: '',
      },
      valid: false,
      errors: {
        firstNameNotSameAsLast: true,
      },
      config: config.controls.doctorInfo,
      controls: {
        firstName: {
          pristineControl: expectedDoctorInfoFirstNameControl,
          ...expectedDoctorInfoFirstNameControl,
        },
        lastName: {
          pristineControl: expectedDoctorInfoLastNameControl,
          ...expectedDoctorInfoLastNameControl,
        },
        email: {
          pristineControl: expectedDoctorInfoEmailControl,
          ...expectedDoctorInfoEmailControl,
        },
      },
    };

    const expectedControl = {
      ...BASE_FORM_CONTROL,
      submitting: false,
      controlRef: [],
      valid: false,
      value: initialValue,
      errors: {
        firstNameNotSameAsLast: true,
      },
      config,
      controls: {
        firstName: {
          pristineControl: expectedFirstNameControl,
          ...expectedFirstNameControl,
        },
        lastName: {
          pristineControl: expectedLastNameControl,
          ...expectedLastNameControl,
        },
        email: {
          pristineControl: expectedEmailControl,
          ...expectedEmailControl,
        },
        phone: {
          pristineControl: expectedPhoneControl,
          ...expectedPhoneControl,
        },
        emergencyContacts: {
          pristineControl: expectedEmergencyContactsControl,
          ...expectedEmergencyContactsControl,
        },
        doctorInfo: {
          pristineControl: expectedDoctorInfoControl,
          ...expectedDoctorInfoControl,
        },
      },
    } as FormGroup<Contact>;
    expect(buildControlState(config)).toEqual({
      pristineControl: expectedControl,
      ...expectedControl,
    });
  });
});
