import { markControlAsTouched } from './markControlAsTouched';
import { markControlAsTouched as markControlAsTouchedAction } from '../../Actions/Hub1/markControlAsTouched';
import { buildFormState } from '../../Helpers/buildFormState';
import { config } from '../../Testing/config';
import { BaseForm } from '../../Models/Controls';
import { Contact } from '../../Testing/Models/Contact';

describe('markControlAsTouched', () => {
  it('should mark control and all anscestors as touched', () => {
    const initialState: BaseForm<Contact> = buildFormState(config);
    const result = markControlAsTouched(
      initialState,
      markControlAsTouchedAction({
        controlRef: ['doctorInfo'],
        markAll: true,
      }),
    );

    expect(result.root.touched).toBe(true);
    expect(result.doctorInfo.touched).toBe(true);
    expect(result['doctorInfo.firstName'].touched).toBe(true);
  });
});
