import {
  config,
  emergencyContactConfigs,
  firstNameNotSameAsLast,
} from '../Testing/config';
import { Contact } from '../Testing/Models/Contact';
import { DoctorInfo } from '../Testing/Models/DoctorInfo';
import {
  BaseControl,
  BaseArrayControl,
  BaseGroupControl,
} from '../Models/Controls';
import {
  FormArrayConfig,
  FormControlConfig,
  FormGroupConfig,
} from '../Models/Configs';
import { required, email } from '../Validators/Validators';
import { uniqueEmail, blacklistedEmail } from '../Testing/AsyncValidators';
import { buildControlState } from './buildControlState';
import { EmergencyContact } from '../Testing/Models/EmergencyContact';

describe('buildControlState', () => {
  const BASE_FORM_CONTROL = {
    dirty: false,
    touched: false,
  };

  it('should build the control state for for type field', () => {
    const expectedControl = {
      ...BASE_FORM_CONTROL,
      controlRef: ['firstName'],
      value: '',
      validatorErrors: {
        required: true,
      },
      validatorsValid: false,
      config: config.controls.firstName,
    } as BaseControl<string>;
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

    const expectedFirstNameControl: BaseControl<string> = {
      ...BASE_FORM_CONTROL,
      controlRef: ['doctorInfo', 'firstName'],
      validatorErrors: {
        required: true,
      },
      validatorsValid: false,
      value: '',
      config: (<FormGroupConfig>config.controls.doctorInfo).controls.firstName,
    };

    const expectedLastNameControl: BaseControl<string> = {
      ...BASE_FORM_CONTROL,
      controlRef: ['doctorInfo', 'lastName'],
      validatorErrors: {
        required: true,
      },
      validatorsValid: false,
      value: '',
      config: (<FormGroupConfig>config.controls.doctorInfo).controls.lastName,
    };
    const expectedEmailControl: BaseControl<string> = {
      ...BASE_FORM_CONTROL,
      controlRef: ['doctorInfo', 'email'],
      validatorErrors: {
        email: false,
        required: true,
      },
      validatorsValid: false,
      value: '',
      config: (<FormGroupConfig>config.controls.doctorInfo).controls.email,
    };
    const expectedControl: BaseGroupControl<DoctorInfo> = {
      ...BASE_FORM_CONTROL,
      controlRef: ['doctorInfo'],
      value: initialValue,
      config: config.controls.doctorInfo,
      validatorErrors: {
        firstNameNotSameAsLast: true,
      },
      validatorsValid: false,
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
    } as BaseGroupControl<DoctorInfo>;
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

    const expectedFirstNameControl: BaseControl<string> = {
      ...BASE_FORM_CONTROL,
      controlRef: ['doctorInfo', 'firstName'],
      validatorErrors: {
        required: false,
      },
      validatorsValid: true,
      value: 'Dr',
      config: testConfig.controls.firstName,
    };

    const expectedLastNameControl: BaseControl<string> = {
      ...BASE_FORM_CONTROL,
      controlRef: ['doctorInfo', 'lastName'],
      validatorErrors: {
        required: false,
      },
      validatorsValid: true,
      value: 'Bob',
      config: testConfig.controls.lastName,
    };

    const expectedEmailControl: BaseControl<string> = {
      ...BASE_FORM_CONTROL,
      controlRef: ['doctorInfo', 'email'],
      validatorErrors: {
        email: true,
        required: false,
      },
      validatorsValid: false,
      value: 'DrBobbob.com',
      config: testConfig.controls.email,
    };

    const expectedControl: BaseGroupControl<DoctorInfo> = {
      ...BASE_FORM_CONTROL,
      controlRef: ['doctorInfo'],
      value: initialValue,
      config: testConfig,
      validatorErrors: {
        firstNameNotSameAsLast: false,
      },
      validatorsValid: false,
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
    } as BaseGroupControl<DoctorInfo>;

    expect(buildControlState(testConfig, ['doctorInfo'])).toEqual({
      pristineControl: expectedControl,
      ...expectedControl,
    });
  });

  it('should build the control state for for type array with empty initial value', () => {
    const expectedControl: BaseArrayControl<unknown> = {
      ...BASE_FORM_CONTROL,
      controlRef: ['emergencyContacts'],
      controls: [],
      value: [],
      config: config.controls.emergencyContacts,
      validatorErrors: {
        required: true,
      },
      validatorsValid: false,
    };
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

    const expectedControl0FirstName: BaseControl<string> = {
      ...BASE_FORM_CONTROL,
      controlRef: ['emergencyContacts', 0, 'firstName'],
      validatorErrors: {
        required: false,
      },
      validatorsValid: true,
      value: 'Homer',
      config: {
        ...emergencyContactConfigs[0].controls.firstName,
        initialValue: 'Homer',
      },
    };

    const expectedControl0LastName: BaseControl<string> = {
      ...BASE_FORM_CONTROL,
      controlRef: ['emergencyContacts', 0, 'lastName'],
      validatorErrors: {
        required: false,
      },
      validatorsValid: true,
      value: 'Simpson',
      config: {
        ...emergencyContactConfigs[0].controls.lastName,
        initialValue: 'Simpson',
      },
    };

    const expectedControl0Email: BaseControl<string> = {
      ...BASE_FORM_CONTROL,
      controlRef: ['emergencyContacts', 0, 'email'],
      validatorErrors: {
        email: false,
        required: false,
      },
      validatorsValid: true,
      value: 'homer@homer.com',
      config: {
        ...emergencyContactConfigs[0].controls.email,
        initialValue: 'homer@homer.com',
      },
    };

    const expectedControl0Relation: BaseControl<string> = {
      ...BASE_FORM_CONTROL,
      controlRef: ['emergencyContacts', 0, 'relation'],
      validatorErrors: {
        required: false,
      },
      validatorsValid: true,
      value: 'friend',
      config: {
        ...emergencyContactConfigs[0].controls.relation,
        initialValue: 'friend',
      },
    };

    const expectedControl0: BaseGroupControl<EmergencyContact> = {
      ...BASE_FORM_CONTROL,
      controlRef: ['emergencyContacts', 0],
      value: {
        firstName: 'Homer',
        lastName: 'Simpson',
        email: 'homer@homer.com',
        relation: 'friend',
      },
      validatorErrors: {
        firstNameNotSameAsLast: false,
      },
      validatorsValid: true,
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
      } as { [key: string]: BaseControl<string> },
    } as BaseGroupControl<EmergencyContact>;

    const expectedControl1FirstName: BaseControl<string> = {
      ...BASE_FORM_CONTROL,
      controlRef: ['emergencyContacts', 1, 'firstName'],
      validatorErrors: {
        required: false,
      },
      validatorsValid: true,
      value: 'moe',
      config: {
        ...emergencyContactConfigs[1].controls.firstName,
        initialValue: 'moe',
      },
    };

    const expectedControl1LastName: BaseControl<string> = {
      ...BASE_FORM_CONTROL,
      controlRef: ['emergencyContacts', 1, 'lastName'],
      validatorErrors: {
        required: false,
      },
      validatorsValid: true,
      value: 'syzlak',
      config: {
        ...emergencyContactConfigs[1].controls.lastName,
        initialValue: 'syzlak',
      },
    };

    const expectedControl1Email: BaseControl<string> = {
      ...BASE_FORM_CONTROL,
      controlRef: ['emergencyContacts', 1, 'email'],
      validatorErrors: {
        email: false,
        required: false,
      },
      validatorsValid: true,
      value: 'moe@moe.com',
      config: {
        ...emergencyContactConfigs[1].controls.email,
        initialValue: 'moe@moe.com',
      },
    };

    const expectedControl1Relation: BaseControl<string> = {
      ...BASE_FORM_CONTROL,
      controlRef: ['emergencyContacts', 1, 'relation'],
      validatorErrors: {
        required: false,
      },
      validatorsValid: true,
      value: 'friend',
      config: {
        ...emergencyContactConfigs[1].controls.relation,
        initialValue: 'friend',
      },
    };

    const expectedControl1: BaseGroupControl<EmergencyContact> = {
      ...BASE_FORM_CONTROL,
      controlRef: ['emergencyContacts', 1],
      value: {
        firstName: 'moe',
        lastName: 'syzlak',
        email: 'moe@moe.com',
        relation: 'friend',
      },
      validatorErrors: {
        firstNameNotSameAsLast: false,
      },
      validatorsValid: true,
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
      } as { [key: string]: BaseControl<unknown> },
    };

    const expectedControl: BaseArrayControl<EmergencyContact[]> = {
      config: nonEmptyConfig,
      controls: [
        {
          pristineControl: expectedControl0,
          ...expectedControl0,
        },
        { pristineControl: expectedControl1, ...expectedControl1 },
      ] as BaseGroupControl<unknown>[],
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
      validatorErrors: {
        required: false,
      },
      validatorsValid: true,
    };

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

    const expectedFirstNameControl: BaseControl<string> = {
      ...BASE_FORM_CONTROL,
      controlRef: ['firstName'],
      value: '',
      validatorErrors: {
        required: true,
      },
      validatorsValid: false,
      config: config.controls.firstName,
    };

    const expectedLastNameControl: BaseControl<string> = {
      ...BASE_FORM_CONTROL,
      controlRef: ['lastName'],
      value: '',
      validatorErrors: {
        required: true,
      },
      validatorsValid: false,
      config: config.controls.lastName,
    };

    const expectedEmailControl: BaseControl<string> = {
      ...BASE_FORM_CONTROL,
      controlRef: ['email'],
      value: '',
      validatorErrors: {
        email: false,
        required: true,
      },
      validatorsValid: false,
      config: config.controls.email,
    };

    const expectedPhoneControl: BaseControl<string> = {
      ...BASE_FORM_CONTROL,
      controlRef: ['phone'],
      value: '',
      validatorErrors: {
        required: true,
        phoneNumber: false,
      },
      validatorsValid: false,
      config: config.controls.phone,
    };

    const expectedEmergencyContactsControl: BaseArrayControl<
      EmergencyContact[]
    > = {
      ...BASE_FORM_CONTROL,
      controlRef: ['emergencyContacts'],
      value: [],
      validatorErrors: {
        required: true,
      },
      validatorsValid: false,
      config: config.controls.emergencyContacts,
      controls: [],
    };

    const expectedDoctorInfoFirstNameControl: BaseControl<string> = {
      ...BASE_FORM_CONTROL,
      controlRef: ['doctorInfo', 'firstName'],
      value: '',
      validatorErrors: {
        required: true,
      },
      validatorsValid: false,
      config: (<FormGroupConfig>config.controls.doctorInfo).controls.firstName,
    };

    const expectedDoctorInfoLastNameControl: BaseControl<string> = {
      ...BASE_FORM_CONTROL,
      controlRef: ['doctorInfo', 'lastName'],
      value: '',
      validatorErrors: {
        required: true,
      },
      validatorsValid: false,
      config: (<FormGroupConfig>config.controls.doctorInfo).controls.lastName,
    };

    const expectedDoctorInfoEmailControl: BaseControl<string> = {
      ...BASE_FORM_CONTROL,
      controlRef: ['doctorInfo', 'email'],
      value: '',
      validatorErrors: {
        email: false,
        required: true,
      },
      validatorsValid: false,
      config: (<FormGroupConfig>config.controls.doctorInfo).controls.email,
    };

    const expectedDoctorInfoControl: BaseGroupControl<DoctorInfo> = {
      ...BASE_FORM_CONTROL,
      controlRef: ['doctorInfo'],
      value: {
        firstName: '',
        lastName: '',
        email: '',
      },
      validatorErrors: {
        firstNameNotSameAsLast: true,
      },
      validatorsValid: false,
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

    const expectedControl: BaseGroupControl<Contact> = {
      ...BASE_FORM_CONTROL,
      controlRef: [],
      value: initialValue,
      validatorErrors: {
        firstNameNotSameAsLast: true,
      },
      validatorsValid: false,
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
    };
    expect(buildControlState(config)).toEqual({
      pristineControl: expectedControl,
      ...expectedControl,
    });
  });
});
