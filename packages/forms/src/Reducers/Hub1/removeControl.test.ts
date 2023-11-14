import { removeControl } from './removeControl';
import { removeControl as removeControlAction } from '../../Actions/Hub1/removeControl';
import { buildFormState } from '../../Helpers/buildFormState';
import { BaseForm } from '../../Models/Controls';
import { FormBuilder } from '../../Helpers/FormBuilder';

describe('removeControl', () => {
  describe('when removing a formGroup control', () => {
    let initialState: BaseForm<{
      firstName: string;
      lastName: string;
      emergencyContact: {
        nextOfKin: string;
      };
    }>;

    const expectedInitialValue = {
      firstName: '',
      lastName: '',
      emergencyContact: {
        nextOfKin: '',
      },
    };

    beforeEach(() => {
      initialState = buildFormState(
        FormBuilder.group({
          controls: {
            firstName: FormBuilder.control({ initialValue: '' }),
            lastName: FormBuilder.control({ initialValue: '' }),
            emergencyContact: FormBuilder.group({
              controls: {
                nextOfKin: FormBuilder.control({ initialValue: '' }),
              },
            }),
          },
        }),
      );

      expect(initialState.root.value).toEqual(expectedInitialValue);
      expect(initialState['emergencyContact.nextOfKin']).toBeTruthy();
    });

    it('should remove a formGroup control', () => {
      const result = removeControl(
        initialState,
        removeControlAction(['emergencyContact', 'nextOfKin']),
      );

      expect(result.root.value).toEqual({
        firstName: '',
        lastName: '',
        emergencyContact: {},
      });
      expect(result['emergencyContact.nextOfKin']).toBeUndefined();
    });

    it('should remove a formGroup control and its descendants', () => {
      const result = removeControl(initialState, removeControlAction(['emergencyContact']));

      expect(result.root.value).toEqual({
        firstName: '',
        lastName: '',
      });
      expect(result['emergencyContact']).toBeUndefined();
      expect(result['emergencyContact.nextOfKin']).toBeUndefined();
    });
  });

  it('should remove an array control item', () => {
    const initialState: BaseForm<{
      firstName: string;
      lastName: string;
      emergencyContacts: string[];
    }> = buildFormState(
      FormBuilder.group({
        controls: {
          firstName: FormBuilder.control({ initialValue: '' }),
          lastName: FormBuilder.control({ initialValue: '' }),
          emergencyContacts: FormBuilder.array({
            controls: [
              FormBuilder.control({ initialValue: 'Homer' }),
              FormBuilder.control({ initialValue: 'Moe' }),
              FormBuilder.control({ initialValue: 'Barney' }),
            ],
          }),
        },
      }),
    );

    expect(initialState.root.value.emergencyContacts).toEqual(['Homer', 'Moe', 'Barney']);
    expect(initialState['emergencyContacts.0'].value).toBe('Homer');
    expect(initialState['emergencyContacts.1'].value).toBe('Moe');
    expect(initialState['emergencyContacts.2'].value).toBe('Barney');

    const result = removeControl(initialState, removeControlAction(['emergencyContacts', 1]));

    expect(result.root.value.emergencyContacts).toEqual(['Homer', 'Barney']);
    expect(result.root.dirty).toBe(true);
    expect(result.emergencyContacts.dirty).toBe(true);
    expect(result['emergencyContacts.0'].value).toBe('Homer');
    expect(result['emergencyContacts.0'].controlRef).toEqual(['emergencyContacts', 0]);
    expect(result['emergencyContacts.1'].value).toBe('Barney');
    expect(result['emergencyContacts.1'].controlRef).toEqual(['emergencyContacts', 1]);
    expect(result['emergencyContacts.2']).toBeUndefined();
  });
});
