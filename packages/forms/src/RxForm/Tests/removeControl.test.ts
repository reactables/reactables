import { build, group, array, control } from '../RxForm';
import { Subscription } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { asyncConfig, asyncEmergencyContactConfigs } from '../../Testing/asyncConfig';

describe('RxForm', () => {
  let testScheduler: TestScheduler;
  let subscription: Subscription;

  beforeEach(() => {
    testScheduler = new TestScheduler((actual, expected) => {
      expect(actual).toMatchObject(expected);
    });
  });

  afterEach(() => {
    subscription?.unsubscribe();
  });

  describe('on removeControl', () => {
    it('should remove a formGroup control', () => {
      testScheduler.run(({ expectObservable, cold }) => {
        const [state$, { removeControl }] = build({
          controls: {
            firstName: control({ initialValue: '' }),
            lastName: control({ initialValue: '' }),
            emergencyContact: group({
              controls: {
                nextOfKin: control({ initialValue: '' }),
              },
            }),
          },
        });

        subscription = cold('-b', { b: removeControl }).subscribe((removeControl) =>
          removeControl(['emergencyContact', 'nextOfKin']),
        );

        expectObservable(state$).toBe('ab', {
          a: {
            root: {
              value: {
                firstName: '',
                lastName: '',
                emergencyContact: {
                  nextOfKin: '',
                },
              },
              dirty: false,
            },
            emergencyContact: {
              value: {
                nextOfKin: '',
              },
              dirty: false,
            },
            'emergencyContact.nextOfKin': {
              value: '',
              dirty: false,
            },
          },
          b: {
            root: {
              value: {
                firstName: '',
                lastName: '',
                emergencyContact: {},
              },
              dirty: true,
            },
            emergencyContact: {
              value: {},
              dirty: true,
            },
          },
        });
      });
    });

    it('should remove a formGroup control and its descendants', () => {
      testScheduler.run(({ expectObservable, cold }) => {
        const [state$, { removeControl }] = build({
          controls: {
            firstName: control({ initialValue: '' }),
            lastName: control({ initialValue: '' }),
            emergencyContact: group({
              controls: {
                nextOfKin: control({ initialValue: '' }),
              },
            }),
          },
        });

        subscription = cold('-b', { b: removeControl }).subscribe((removeControl) =>
          removeControl(['emergencyContact']),
        );

        expectObservable(state$).toBe('ab', {
          a: {
            root: {
              value: {
                firstName: '',
                lastName: '',
                emergencyContact: {
                  nextOfKin: '',
                },
              },
              dirty: false,
            },
            emergencyContact: {
              value: {
                nextOfKin: '',
              },
              dirty: false,
            },
            'emergencyContact.nextOfKin': {
              value: '',
              dirty: false,
            },
          },
          b: {
            root: {
              value: {
                firstName: '',
                lastName: '',
              },
              dirty: true,
            },
          },
        });
      });
    });

    it('should remove an array control item', () => {
      testScheduler.run(({ expectObservable, cold }) => {
        const [state$, { removeControl }] = build(
          group({
            controls: {
              emergencyContacts: array({
                controls: [
                  control({ initialValue: 'Homer' }),
                  control({ initialValue: 'Moe' }),
                  control({ initialValue: 'Barney' }),
                ],
              }),
            },
          }),
        );

        subscription = cold('-b', { b: removeControl }).subscribe((removeControl) =>
          removeControl(['emergencyContacts', 1]),
        );

        expectObservable(state$).toBe('ab', {
          a: {
            root: {
              value: {
                emergencyContacts: ['Homer', 'Moe', 'Barney'],
              },
              dirty: false,
            },
            emergencyContacts: { value: ['Homer', 'Moe', 'Barney'], dirty: false },
            'emergencyContacts.0': { value: 'Homer', dirty: false },
            'emergencyContacts.1': { value: 'Moe', dirty: false },
            'emergencyContacts.2': { value: 'Barney', dirty: false },
          },
          b: {
            root: {
              value: {
                emergencyContacts: ['Homer', 'Barney'],
              },
              dirty: true,
            },
            emergencyContacts: { value: ['Homer', 'Barney'], dirty: true },
            'emergencyContacts.0': { value: 'Homer', dirty: false },
            'emergencyContacts.1': { value: 'Barney', dirty: false },
          },
        });
      });
    });

    it('should emit async validation when removing a control', () => {
      testScheduler.run(({ expectObservable, cold }) => {
        const [state$, { removeControl }] = build(
          group({
            ...asyncConfig,
            controls: {
              ...asyncConfig.controls,
              emergencyContacts: {
                ...asyncConfig.controls.emergencyContacts,
                controls: asyncEmergencyContactConfigs,
              },
            },
          }),
        );

        subscription = cold('-b', { b: removeControl }).subscribe((removeControl) =>
          removeControl(['emergencyContacts', 0]),
        );

        expectObservable(state$).toBe('a(bcd) 345ms e 49ms f', {
          a: {},
          b: {},
          c: {
            root: { pending: true, asyncValidateInProgress: { 0: true } },
          },
          d: {
            emergencyContacts: { pending: true, asyncValidateInProgress: { 0: true } },
          },
          e: {
            root: {
              pending: true,
              asyncValidateInProgress: { 0: true },
            },
            emergencyContacts: {
              pending: false,
              asyncValidateInProgress: { 0: false },
              asyncValidatorErrors: { arrayLengthError: true },
            },
          },
          f: {
            root: {
              pending: false,
              asyncValidateInProgress: { 0: false },
              asyncValidatorErrors: { uniqueFirstAndLastName: true },
            },
          },
        });
      });
    });
  });
});
