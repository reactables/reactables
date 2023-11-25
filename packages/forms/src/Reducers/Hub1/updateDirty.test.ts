import { updateDirty } from './updateDirty';
import { updateValues } from './updateValues';
import { buildFormState } from '../../Helpers/buildFormState';
import { config, emergencyContactConfigs } from '../../Testing/config';
import { FormArrayConfig } from '../../Models/Configs';

describe('updateDirty', () => {
  it('should verify intitial state is not dirty', () => {
    const initialState = buildFormState(config).form;
    expect(updateDirty(initialState)).toEqual(initialState);
  });

  it('should mark all relevant controls dirty after update', () => {
    const nonEmptyConfig = {
      ...(config.controls.emergencyContacts as FormArrayConfig),
      controls: emergencyContactConfigs,
    } as FormArrayConfig;

    const initialState = buildFormState({
      ...config,
      controls: {
        ...config.controls,
        emergencyContacts: nonEmptyConfig,
      },
    });

    const value = 'Moe first name changed';

    const result = updateDirty(
      updateValues(initialState, {
        type: 'updateValues',
        payload: {
          controlRef: ['emergencyContacts', 1, 'firstName'],
          value,
        },
      }).form,
    );

    expect(result.root.dirty).toBe(true);
    expect(result.emergencyContacts.dirty).toBe(true);
    expect(result['emergencyContacts.1'].dirty).toBe(true);
    expect(result['emergencyContacts.0'].dirty).toBe(false);
    expect(result['emergencyContacts.1.firstName'].dirty).toBe(true);
    expect(result['emergencyContacts.1.lastName'].dirty).toBe(false);
  });
});
