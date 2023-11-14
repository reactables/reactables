import cloneDeep from 'lodash.clonedeep';
import { getDescendantControls } from './getDescendantControls';
import { buildFormState } from './buildFormState';
import { config, emergencyContactConfigs } from '../Testing/config';
import { FormArrayConfig, FormGroupConfig } from '../Models/Configs';

describe('getDescendantControls', () => {
  it('should get child controls', () => {
    const clonedConfig: FormGroupConfig = cloneDeep(config);
    (<FormArrayConfig>clonedConfig.controls.emergencyContacts).controls = emergencyContactConfigs;

    const form = buildFormState(clonedConfig);

    const childControlRefs = getDescendantControls(['emergencyContacts'], form).map(
      (control) => control.controlRef,
    );

    expect(childControlRefs).toEqual([
      ['emergencyContacts'],
      ['emergencyContacts', 0],
      ['emergencyContacts', 0, 'firstName'],
      ['emergencyContacts', 0, 'lastName'],
      ['emergencyContacts', 0, 'email'],
      ['emergencyContacts', 0, 'relation'],
      ['emergencyContacts', 1],
      ['emergencyContacts', 1, 'firstName'],
      ['emergencyContacts', 1, 'lastName'],
      ['emergencyContacts', 1, 'email'],
      ['emergencyContacts', 1, 'relation'],
    ]);
  });
});
