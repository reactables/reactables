import { config, emergencyContactConfigs } from '../Testing/config';
import { FormGroupConfig, FormArrayConfig } from '../Models/Configs';
import { getValueFromControlConfig } from './getValueFromControlConfig';

describe('getValueFromConfig', () => {
  it('should return the correct initial empty value from config', () => {
    expect(getValueFromControlConfig(config)).toEqual({
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
    });
  });
  it('should return the correct non-empty value from config', () => {
    const intialValue = [
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
    expect(
      getValueFromControlConfig({
        ...config,
        controls: {
          ...config.controls,
          emergencyContacts: {
            ...config.controls.emergencyContacts,
            controls: emergencyContactConfigs,
          } as FormArrayConfig,
        },
      } as FormGroupConfig),
    ).toEqual({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      emergencyContacts: intialValue,
      doctorInfo: {
        firstName: '',
        lastName: '',
        email: '',
      },
    });
  });
});
