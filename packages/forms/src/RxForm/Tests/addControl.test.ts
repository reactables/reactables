import { build, control, group } from '../RxForm';
import { Subscription } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { config } from '../../Testing/config';
import { asyncConfig } from '../../Testing/asyncConfig';
import * as Validators from '../../Testing/Validators';
import * as AsyncValidators from '../../Testing/AsyncValidators';
import { tap, map } from 'rxjs/operators';

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

  describe('on addControl', () => {
    it('should add a control to a Form Group control and update ancestor values', () => {
      testScheduler.run(({ expectObservable, cold }) => {
        const [state$, { addControl }] = build(config, {
          providers: { validators: Validators, asyncValidators: AsyncValidators },
        });

        subscription = cold('-b', { b: addControl }).subscribe((addControl) =>
          addControl({
            controlRef: ['doctorInfo', 'type'],
            config: control({
              initialValue: 'proctologist',
            }),
          }),
        );

        expectObservable(state$).toBe('ab', {
          a: {},
          b: {
            root: {
              value: {
                doctorInfo: {
                  type: 'proctologist',
                },
              },
              dirty: true,
            },
            doctorInfo: {
              dirty: true,
              value: { type: 'proctologist' },
            },
            'doctorInfo.type': {
              value: 'proctologist',
              dirty: false,
            },
          },
        });
      });
    });

    it('should emit async validation for an added group control and all ancestors', () => {
      testScheduler.run(({ expectObservable, cold }) => {
        const [state$, { addControl }] = build(asyncConfig, {
          providers: { validators: Validators, asyncValidators: AsyncValidators },
        });

        subscription = cold('-b', {
          b: () =>
            addControl({
              controlRef: ['doctorInfo', 'type'],
              config: {
                initialValue: 'proctologist',
                validators: ['required'],
                asyncValidators: ['blacklistedDoctorType'],
              },
            }),
        }).subscribe((action) => action());

        expectObservable(state$).toBe('a(bcde) 394ms (fg) 96ms h', {
          a: {},
          b: {
            root: {
              value: {
                doctorInfo: {
                  type: 'proctologist',
                },
              },
              dirty: true,
            },
            doctorInfo: {
              value: { type: 'proctologist' },
              dirty: true,
            },
            'doctorInfo.type': { value: 'proctologist', dirty: false },
          },
          c: {
            root: { pending: true, asyncValidateInProgress: { 0: true } },
          },
          d: { doctorInfo: { pending: true, asyncValidateInProgress: { 0: true } } },
          e: { 'doctorInfo.type': { pending: true, asyncValidateInProgress: { 0: true } } },
          f: {
            root: {
              pending: true,
              asyncValidateInProgress: { 0: false },
              asyncValidatorErrors: {
                uniqueFirstAndLastName: true,
              },
            },
          },
          g: {
            doctorInfo: {
              pending: true,
              asyncValidateInProgress: { 0: false },
              asyncValidatorErrors: {
                uniqueFirstAndLastName: true,
              },
            },
          },
          h: {
            root: { pending: false },
            doctorInfo: { pending: false },
            'doctorInfo.type': {
              pending: false,
              asyncValidateInProgress: { 0: false },
              asyncValidatorErrors: { blacklistedDoctorType: true },
            },
          },
        });
      });
    });

    it('should add a form group and have keys in correct order', () => {
      const rootConfig = group({ controls: {} });

      testScheduler.run(({ expectObservable, cold }) => {
        const [state$, { addControl }] = build(rootConfig, {
          providers: { validators: Validators, asyncValidators: AsyncValidators },
        });

        subscription = cold('-b', { b: addControl }).subscribe((addControl) =>
          addControl({
            controlRef: ['doctorInfo'],
            config: group({
              controls: {
                firstName: control(['']),
                lastName: control(['']),
                email: control(['']),
              },
            }),
          }),
        );
        expectObservable(state$.pipe(map((state) => Object.keys(state)))).toBe('ab', {
          a: ['root'],
          b: [
            'root',
            'doctorInfo',
            'doctorInfo.firstName',
            'doctorInfo.lastName',
            'doctorInfo.email',
          ],
        });
      });
    });
  });
});
