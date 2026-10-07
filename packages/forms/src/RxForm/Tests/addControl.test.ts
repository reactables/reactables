import { build, control, group } from '../RxForm';
import { Subscription } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { config } from '../../Testing/config';
import { asyncConfig } from '../../Testing/asyncConfig';
import * as Validators from '../../Testing/Validators';
import * as AsyncValidators from '../../Testing/AsyncValidators';
import { map } from 'rxjs/operators';
import { Form } from '../../Models/Controls';

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

        expectObservable(state$).toBe('a(zyxbcde) 391ms (fg) 96ms h', {
          a: {},
          z: {},
          y: {},
          x: {},
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

    it('should add a form group when a child control key is all digits', () => {
      const [state$, { addControl }] = build(group({ controls: {} }), {
        providers: { validators: Validators, asyncValidators: AsyncValidators },
      });

      let state = {} as Form<unknown>;
      subscription = state$.subscribe((s) => (state = s));

      // Each key takes 5 Math.random calls. Calls 6-10 build the first child's key, which these
      // values made "11111" before keys were forced to start with a letter.
      const random = Math.random;
      let calls = 0;
      jest
        .spyOn(Math, 'random')
        .mockImplementation(() => (++calls > 5 && calls <= 10 ? 53.5 / 62 : random()));

      addControl({
        controlRef: ['doctorInfo'],
        config: group({
          controls: {
            firstName: control(['', 'required']),
            lastName: control(['']),
          },
        }),
      });

      jest.restoreAllMocks();

      expect(state['doctorInfo.firstName'].valid).toBe(false);
      expect(state['doctorInfo'].valid).toBe(false);
      expect(state['root'].valid).toBe(false);
    });
  });
});
