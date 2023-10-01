import { formChange, DEFAULT_HUB2_FIELDS } from './formChange';
import { buildControlState } from '../../Helpers/buildControlState';
import { FORMS_FORM_CHANGE } from '../../Actions/Hub2/formChange';
import {
  FormGroup,
  BaseGroupControl,
  BaseArrayControl,
} from '../../Models/Controls';
import {
  FormGroupConfig,
  FormArrayConfig,
  FormControlConfig,
} from '../../Models';
import { Contact } from '../../Testing/Models/Contact';
import { DoctorInfo } from '../../Testing/Models/DoctorInfo';
import { FORMS_CONTROL_CHANGE } from '../../Actions/Hub1/controlChange';
import { updateValues } from '../Hub1/updateValues';
import { removeControl } from '../Hub1/removeControl';
import { FORMS_REMOVE_CONTROL } from '../../Actions/Hub1/removeControl';
import { FORMS_ADD_FORM_ARRAY_CONTROL } from '../../Actions/Hub1/addArrayControl';
import { required, email } from '../../Validators';
import { addFormArrayControl } from '../Hub1/addFormArrayControl';
import {
  emergencyContactConfigs,
  firstNameNotSameAsLast,
  config,
} from '../../Testing/config';
import {
  uniqueEmail,
  uniqueFirstAndLastName,
  blacklistedEmail,
} from '../../Testing/AsyncValidators';
import cloneDeep = require('lodash.clonedeep');
import { EmergencyContact } from '../../Testing/Models/EmergencyContact';

describe('formChange', () => {
  const getExpectedState = (baseState: BaseGroupControl<Contact>) => ({
    ...baseState,
    ...DEFAULT_HUB2_FIELDS,
    controls: {
      firstName: {
        ...baseState.controls.firstName,
        ...DEFAULT_HUB2_FIELDS,
      },
      lastName: {
        ...baseState.controls.lastName,
        ...DEFAULT_HUB2_FIELDS,
      },
      email: {
        ...baseState.controls.email,
        ...DEFAULT_HUB2_FIELDS,
      },
      phone: {
        ...baseState.controls.phone,
        ...DEFAULT_HUB2_FIELDS,
      },
      emergencyContacts: {
        ...baseState.controls.emergencyContacts,
        ...DEFAULT_HUB2_FIELDS,
      },
      doctorInfo: {
        ...baseState.controls.doctorInfo,
        ...DEFAULT_HUB2_FIELDS,
        controls: {
          firstName: {
            ...(<BaseGroupControl<DoctorInfo>>baseState.controls.doctorInfo)
              .controls.firstName,
            ...DEFAULT_HUB2_FIELDS,
          },
          lastName: {
            ...(<BaseGroupControl<DoctorInfo>>baseState.controls.doctorInfo)
              .controls.lastName,
            ...DEFAULT_HUB2_FIELDS,
          },
          email: {
            ...(<BaseGroupControl<DoctorInfo>>baseState.controls.doctorInfo)
              .controls.email,
            ...DEFAULT_HUB2_FIELDS,
          },
        },
      } as FormGroup<DoctorInfo>,
    },
  });

  it('should initialize async properties', () => {
    const initialBaseState = buildControlState(
      config,
    ) as BaseGroupControl<Contact>;
    const action = {
      type: FORMS_FORM_CHANGE,
      payload: initialBaseState,
    };

    const initialState = formChange(null, action);

    const expectedState: FormGroup<Contact> =
      getExpectedState(initialBaseState);

    expect(initialState).toEqual(expectedState);
  });

  it('should update syncrounous properties only', () => {
    const initialBaseState = buildControlState(
      config,
    ) as BaseGroupControl<Contact>;

    const newBaseState = updateValues(initialBaseState, {
      type: FORMS_CONTROL_CHANGE,
      payload: {
        controlRef: ['doctorInfo', 'firstName'],
        value: 'Dr First Name Change',
      },
    });

    const initialState = formChange(null, {
      type: FORMS_FORM_CHANGE,
      payload: initialBaseState,
    });

    const newState = formChange(initialState, {
      type: FORMS_FORM_CHANGE,
      payload: newBaseState,
    }) as FormGroup<Contact>;

    const expectedState = getExpectedState(
      newBaseState as BaseGroupControl<Contact>,
    );

    expect(newState).toEqual(expectedState);
  });

  it('should remove control', () => {
    const initialBaseState = buildControlState(
      config,
    ) as BaseGroupControl<Contact>;

    const initialState = formChange(null, {
      type: FORMS_FORM_CHANGE,
      payload: initialBaseState,
    });

    const newBaseState = removeControl(initialBaseState, {
      type: FORMS_REMOVE_CONTROL,
      payload: ['doctorInfo'],
    }) as BaseGroupControl<unknown>;

    const newState = formChange(initialState, {
      type: FORMS_FORM_CHANGE,
      payload: newBaseState,
    }) as FormGroup<Contact>;

    expect(newState).toEqual({
      ...newBaseState,
      ...DEFAULT_HUB2_FIELDS,
      controls: {
        firstName: {
          ...newBaseState.controls.firstName,
          ...DEFAULT_HUB2_FIELDS,
        },
        lastName: {
          ...newBaseState.controls.lastName,
          ...DEFAULT_HUB2_FIELDS,
        },
        email: {
          ...newBaseState.controls.email,
          ...DEFAULT_HUB2_FIELDS,
        },
        phone: {
          ...newBaseState.controls.phone,
          ...DEFAULT_HUB2_FIELDS,
        },
        emergencyContacts: {
          ...newBaseState.controls.emergencyContacts,
          ...DEFAULT_HUB2_FIELDS,
        },
      },
    });
  });

  it('should add control', () => {
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
    const initialBaseState = buildControlState(
      clonedConfig,
    ) as BaseGroupControl<Contact>;

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

    const initialState = formChange(null, {
      type: FORMS_FORM_CHANGE,
      payload: initialBaseState,
    });

    const newBaseState = addFormArrayControl(initialBaseState, {
      type: FORMS_ADD_FORM_ARRAY_CONTROL,
      payload: {
        config: newControlConfig,
        controlRef: ['emergencyContacts'],
      },
    }) as BaseGroupControl<Contact>;

    const newState = formChange(initialState, {
      type: FORMS_FORM_CHANGE,
      payload: newBaseState,
    }) as FormGroup<Contact>;

    const expectedState = getExpectedState(newBaseState) as FormGroup<Contact>;
    expectedState.controls.emergencyContacts = {
      ...expectedState.controls.emergencyContacts,
      value: initialValue.concat({
        firstName: 'Barney',
        lastName: 'Gumble',
        email: 'barney@gumble.com',
        relation: 'astronaut friend',
      }),
      controls: (<BaseArrayControl<EmergencyContact[]>>(
        newBaseState.controls.emergencyContacts
      )).controls.map((control: FormGroup<EmergencyContact>) => ({
        ...control,
        ...DEFAULT_HUB2_FIELDS,
        controls: Object.entries(control.controls).reduce(
          (acc, [key, emergContactControl]) => {
            acc[key] = {
              ...emergContactControl,
              ...DEFAULT_HUB2_FIELDS,
            };
            return acc;
          },
          {},
        ),
      })),
    };

    expect(newState).toEqual(expectedState);
  });
});
