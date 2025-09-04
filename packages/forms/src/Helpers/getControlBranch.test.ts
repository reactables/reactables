import cloneDeep from 'lodash.clonedeep';
import { getControlBranch } from './getControlBranch';
import { buildFormState } from './buildFormState';
import { config, emergencyContactConfigs } from '../Testing/config';
import { FormArrayConfig, FormGroupConfig } from '../Models/Configs';
import * as Validators from '../Testing/Validators';
import * as AsyncValidators from '../Testing/AsyncValidators';
import * as builtValidators from '../Validators/Validators';

describe('getControlBranch', () => {
  it('should get entire branch controls', () => {
    const clonedConfig: FormGroupConfig = cloneDeep(config);
    (<FormArrayConfig>clonedConfig.controls.emergencyContacts).controls = emergencyContactConfigs;

    const { form } = buildFormState(clonedConfig, undefined, {
      validators: { ...Validators, ...builtValidators },
      asyncValidators: AsyncValidators,
    });

    const ancestorControlRefs = getControlBranch(['emergencyContacts'], form).map(
      (control) => control.controlRef,
    );

    expect(ancestorControlRefs).toEqual([
      [],
      ['emergencyContacts'],
      ['emergencyContacts', 0],
      ['emergencyContacts', 1],
      ['emergencyContacts', 0, 'firstName'],
      ['emergencyContacts', 0, 'lastName'],
      ['emergencyContacts', 0, 'email'],
      ['emergencyContacts', 0, 'relation'],
      ['emergencyContacts', 1, 'firstName'],
      ['emergencyContacts', 1, 'lastName'],
      ['emergencyContacts', 1, 'email'],
      ['emergencyContacts', 1, 'relation'],
    ]);
  });
});
