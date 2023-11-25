import { syncValidate } from './syncValidate';
import { buildFormState } from '../../Helpers/buildFormState';
import { config } from '../../Testing/config';
import { required } from '../../Validators';
import { RxForm } from '../../RxForm/RxForm';

describe('syncValidate', () => {
  it('should verify intitial state is not valid', () => {
    const initialState = buildFormState(config).form;
    const result = syncValidate(initialState);

    expect(result.root.validatorsValid).toBe(false);
    expect(result.root.validatorErrors).toEqual({
      firstNameNotSameAsLast: true,
    });
    expect(result.firstName.validatorsValid).toBe(false);
    expect(result.firstName.validatorErrors).toEqual({
      required: true,
    });
    expect(result.lastName.validatorsValid).toBe(false);
    expect(result.lastName.validatorErrors).toEqual({
      required: true,
    });
    expect(result.email.validatorsValid).toBe(false);
    expect(result.email.validatorErrors).toEqual({
      email: false,
      required: true,
    });
    expect(result.phone.validatorsValid).toBe(false);
    expect(result.phone.validatorErrors).toEqual({
      phoneNumber: false,
      required: true,
    });
    expect(result.emergencyContacts.validatorsValid).toBe(false);
    expect(result.emergencyContacts.validatorErrors).toEqual({
      required: true,
    });
    expect(result.doctorInfo.validatorsValid).toBe(false);
    expect(result.doctorInfo.validatorErrors).toEqual({
      firstNameNotSameAsLast: true,
    });
    expect(result['doctorInfo.firstName'].validatorsValid).toBe(false);
    expect(result['doctorInfo.firstName'].validatorErrors).toEqual({
      required: true,
    });
    expect(result['doctorInfo.lastName'].validatorsValid).toBe(false);
    expect(result['doctorInfo.lastName'].validatorErrors).toEqual({
      required: true,
    });
    expect(result['doctorInfo.email'].validatorsValid).toBe(false);
    expect(result['doctorInfo.email'].validatorErrors).toEqual({
      email: false,
      required: true,
    });
  });

  it('should ancestor control validatorsValid should be false if a descendant as an error', () => {
    const config = RxForm.group({
      controls: {
        name: RxForm.control({ initialValue: '', validators: [required] }),
        nameList: RxForm.array({
          controls: [RxForm.control({ initialValue: '', validators: [required] })],
        }),
      },
    });

    const initialState = buildFormState(config).form;
    const result = syncValidate(initialState);

    expect(result.root.validatorsValid).toBe(false);
    expect(result.root.validatorErrors).toEqual({});
    expect(result.name.validatorsValid).toBe(false);
    expect(result.name.validatorErrors).toEqual({
      required: true,
    });
    expect(result.nameList.validatorsValid).toBe(false);
    expect(result.nameList.validatorErrors).toEqual({});
    expect(result['nameList.0'].validatorsValid).toBe(false);
    expect(result['nameList.0'].validatorErrors).toEqual({ required: true });
  });
});
