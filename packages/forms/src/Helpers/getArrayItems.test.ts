import { BaseFormState } from '../Models/Controls';
import { config, emergencyContactConfigs } from '../Testing/config';
import { buildFormState } from './buildFormState';
import { getArrayItems } from './getArrayItems';
import { Contact } from '../Testing/Models/Contact';
import { FormArrayConfig } from '../Models';
import * as Validators from '../Testing/Validators';
import * as AsyncValidators from '../Testing/AsyncValidators';
import * as builtValidators from '../Validators/Validators';

describe('getArrayItems', () => {
  it('should return array items for a FA', () => {
    const nonEmptyConfig = {
      ...(config.controls.emergencyContacts as FormArrayConfig),
      controls: emergencyContactConfigs,
    } as FormArrayConfig;

    const state: BaseFormState<Contact> = buildFormState(
      {
        ...config,
        controls: {
          ...config.controls,
          emergencyContacts: nonEmptyConfig,
        },
      },
      undefined,
      undefined,
      {
        validators: { ...Validators, ...builtValidators },
        asyncValidators: AsyncValidators,
      },
    );

    const result = getArrayItems(['emergencyContacts'], state.form);
    expect(result.map(({ controlRef }) => controlRef)).toEqual([
      ['emergencyContacts', 0],
      ['emergencyContacts', 1],
    ]);
  });
});
