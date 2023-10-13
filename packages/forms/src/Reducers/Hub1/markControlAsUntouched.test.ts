import { markControlAsUntouched } from './markControlAsUntouched';
import { markControlAsTouched } from './markControlAsTouched';
import { buildFormState } from '../../Helpers/buildFormState';
import { config } from '../../Testing/config';
import { BaseForm } from '../../Models/Controls';
import { Contact } from '../../Testing/Models/Contact';
import { markControlAsUntouched as markControlAsUntouchedAction } from '../../Actions/Hub1/markControlAsUntouched';
import { markControlAsTouched as markControlAsTouchedAction } from '../../Actions/Hub1/markControlAsTouched';

describe('markControlAsUntouched', () => {
  it('should mark control and all relevant controls untouched', () => {
    const initialState: BaseForm<Contact> = buildFormState(config);

    const touchedState = markControlAsTouched(
      initialState,
      markControlAsTouchedAction({ controlRef: ['doctorInfo', 'firstName'] }),
    );

    const result = markControlAsUntouched(
      touchedState,
      markControlAsUntouchedAction(['doctorInfo']),
    );

    expect(result.root.touched).toBe(false);
    expect(result.doctorInfo.touched).toBe(false);
    expect(result['doctorInfo.firstName'].touched).toBe(false);
  });
});
