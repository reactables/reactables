import cloneDeep from 'lodash.clonedeep';
import { getAncestorControls } from './getAncestorControls';
import { buildFormState } from './buildFormState';
import { config, emergencyContactConfigs } from '../Testing/config';
import { FormArrayConfig, FormGroupConfig } from '../Models/Configs';

describe('getAncestorControls', () => {
  it('should get ancestor controls', () => {
    const clonedConfig: FormGroupConfig = cloneDeep(config);
    (<FormArrayConfig>clonedConfig.controls.emergencyContacts).controls = emergencyContactConfigs;

    const form = buildFormState(clonedConfig);

    const ancestorControlRefs = getAncestorControls(
      ['emergencyContacts', 1, 'firstName'],
      form,
    ).map((control) => control.controlRef);

    expect(ancestorControlRefs).toEqual([
      [],
      ['emergencyContacts'],
      ['emergencyContacts', 1],
      ['emergencyContacts', 1, 'firstName'],
    ]);
  });
});
