import { updateDirty } from './updateDirty';
import { updateValues } from './updateValues';
import { buildFormState } from '../../Helpers/buildFormState';
import { config, emergencyContactConfigs } from '../../Testing/config';
import { BaseForm } from '../../Models/Controls';
import { Contact } from '../../Testing/Models/Contact';
import { FormArrayConfig } from '../../Models/Configs';
import { controlChange } from '../../Actions/Hub1/controlChange';

describe('updateDirty', () => {
  it('should verify intitial state is not dirty', () => {
    const initialState: BaseForm<Contact> = buildFormState(config);
    expect(updateDirty(initialState)).toEqual(initialState);
  });

  it('should mark all relevant controls dirty after update', () => {
    const nonEmptyConfig = {
      ...(config.controls.emergencyContacts as FormArrayConfig),
      controls: emergencyContactConfigs,
    } as FormArrayConfig;

    const initialState: BaseForm<Contact> = buildFormState({
      ...config,
      controls: {
        ...config.controls,
        emergencyContacts: nonEmptyConfig,
      },
    });

    const value = 'Moe first name changed';

    const result = updateDirty(
      updateValues(
        initialState,
        controlChange({
          controlRef: ['emergencyContacts', 1, 'firstName'],
          value,
        }),
      ),
    );

    expect(result.root.dirty).toBe(true);
    expect(result.emergencyContacts.dirty).toBe(true);
    expect(result['emergencyContacts.1'].dirty).toBe(true);
    expect(result['emergencyContacts.0'].dirty).toBe(false);
    expect(result['emergencyContacts.1.firstName'].dirty).toBe(true);
    expect(result['emergencyContacts.1.lastName'].dirty).toBe(false);
  });
});
