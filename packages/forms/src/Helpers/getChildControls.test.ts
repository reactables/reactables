import cloneDeep from 'lodash.clonedeep';
import { getChildControls } from './getChildControls';

import { buildControlState } from '../Helpers/buildControlState';
import { config, emergencyContactConfigs } from '../Testing/config';
import { FormArrayConfig, FormGroupConfig } from '../Models/Configs';

describe('getChildControls', () => {
  it('should get child controls', () => {
    const clonedConfig: FormGroupConfig = cloneDeep(config);
    (<FormArrayConfig>clonedConfig.controls.emergencyContacts).controls =
      emergencyContactConfigs;

    const arrayControl = buildControlState(
      clonedConfig.controls.emergencyContacts,
    );

    const controlRefs = getChildControls(arrayControl).map(
      ({ controlRef }) => controlRef,
    );

    expect(controlRefs).toEqual([
      [],
      [0],
      [0, 'firstName'],
      [0, 'lastName'],
      [0, 'email'],
      [0, 'relation'],
      [1],
      [1, 'firstName'],
      [1, 'lastName'],
      [1, 'email'],
      [1, 'relation'],
    ]);
  });
});
