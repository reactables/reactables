import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { TestScheduler } from 'rxjs/testing';
import { FormBuilder } from './FormBuilder';
import { buildHub2Source } from './buildHub2Source';
import { buildHub1Reducer } from '../Reducers/Hub1/buildHub1Reducer';
import { Reducer, Action, HubFactory } from '@hub-fx/core';
import { BaseForm, BaseControl } from '../Models/Controls';
import { FormArrayConfig } from '../Models/Configs';
import { Contact } from '../Testing/Models/Contact';
import { controlChange } from '../Actions/Hub1/controlChange';
import { FORMS_ASYNC_VALIDATE_CONTROL } from '../Actions/Hub2/valueChange';
import { FORMS_FORM_CHANGE } from '../Actions/Hub2/formChange';
import {
  config,
  emergencyContactConfigs,
  firstNameNotSameAsLast,
} from '../Testing/config';
import cloneDeep from 'lodash.clonedeep';
import { addControl } from '../Actions/Hub1/addControl';
import { removeControl } from '../Actions/Hub1/removeControl';
import { resetControl } from '../Actions/Hub1/resetControl';
import { required, email } from '../Validators/Validators';
import {
  uniqueEmail,
  blacklistedDoctorType,
  uniqueFirstAndLastName,
  blacklistedEmail,
} from '../Testing/AsyncValidators';

describe('buildHub2Source', () => {
  let testScheduler: TestScheduler;
  let subscription: Subscription;

  const mapTypeAndControlRef = <T>({
    type,
    payload,
  }: Action<BaseForm<T>> | Action<BaseControl<unknown>>) => ({
    type,
    controlRef: payload.controlRef,
  });

  beforeEach(() => {
    testScheduler = new TestScheduler((actual, expected) => {
      expect(actual).toEqual(expected);
    });
  });

  afterEach(() => {
    subscription?.unsubscribe();
  });

  describe('on form change', () => {
    it('should emit async validation actions for a form control', () => {
      testScheduler.run(({ expectObservable, cold }) => {
        const config = FormBuilder.control(['', null, uniqueEmail]);

        const reducer = buildHub1Reducer(config) as Reducer<BaseForm<string>>;

        const hub = HubFactory();

        const sourceForHub2$ = buildHub2Source(reducer, hub);

        const action = controlChange({
          value: 'new@email.com',
          controlRef: [],
        });

        const input$ = cold('a', {
          a: action,
        });

        subscription = input$.subscribe(hub.dispatch);
        expectObservable(sourceForHub2$.pipe(map(({ type }) => type))).toBe(
          '(ab)',
          {
            a: FORMS_FORM_CHANGE,
            b: FORMS_ASYNC_VALIDATE_CONTROL,
          },
        );
      });
    });

    it('should emit async validation actions for multiple form controls and all ancestors', () => {
      testScheduler.run(({ expectObservable, cold }) => {
        const clonedConfig = cloneDeep(config);

        (<FormArrayConfig>clonedConfig.controls.emergencyContacts).controls =
          emergencyContactConfigs;

        const reducer = buildHub1Reducer(clonedConfig) as Reducer<
          BaseForm<Contact>
        >;
        const hub = HubFactory();

        const sourceForHub2$ = buildHub2Source(reducer, hub);

        const action = controlChange({
          controlRef: ['emergencyContacts', 1, 'email'],
          value: 'moechanged@email.com',
        });

        const actionTwo = controlChange({
          controlRef: ['emergencyContacts', 0, 'email'],
          value: 'homerchanged@email.com',
        });

        const input$ = cold('a-------b', {
          a: action,
          b: actionTwo,
        });

        subscription = input$.subscribe(hub.dispatch);
        expectObservable(sourceForHub2$.pipe(map(mapTypeAndControlRef))).toBe(
          '(abcde)-(fghij)',
          {
            a: { type: FORMS_FORM_CHANGE, controlRef: undefined },
            b: {
              type: FORMS_ASYNC_VALIDATE_CONTROL,
              controlRef: [],
            },
            c: {
              type: FORMS_ASYNC_VALIDATE_CONTROL,
              controlRef: ['emergencyContacts'],
            },
            d: {
              type: FORMS_ASYNC_VALIDATE_CONTROL,
              controlRef: ['emergencyContacts', 1],
            },
            e: {
              type: FORMS_ASYNC_VALIDATE_CONTROL,
              controlRef: ['emergencyContacts', 1, 'email'],
            },
            f: { type: FORMS_FORM_CHANGE, controlRef: undefined },
            g: {
              type: FORMS_ASYNC_VALIDATE_CONTROL,
              controlRef: [],
            },
            h: {
              type: FORMS_ASYNC_VALIDATE_CONTROL,
              controlRef: ['emergencyContacts'],
            },
            i: {
              type: FORMS_ASYNC_VALIDATE_CONTROL,
              controlRef: ['emergencyContacts', 0],
            },
            j: {
              type: FORMS_ASYNC_VALIDATE_CONTROL,
              controlRef: ['emergencyContacts', 0, 'email'],
            },
          },
        );
      });
    });

    it('should emit async validation for an added group control and all ancestors', () => {
      testScheduler.run(({ expectObservable, cold }) => {
        const reducer = buildHub1Reducer(cloneDeep(config)) as Reducer<
          BaseForm<Contact>
        >;

        const hub = HubFactory();

        const sourceForHub2$ = buildHub2Source(reducer, hub);

        const action = addControl({
          controlRef: ['doctorInfo', 'type'],
          config: {
            initialValue: 'proctologist',
            validators: [required],
            asyncValidators: [blacklistedDoctorType],
          },
        });

        const input$ = cold('-a', {
          a: action,
        });

        subscription = input$.subscribe(hub.dispatch);
        expectObservable(sourceForHub2$.pipe(map(mapTypeAndControlRef))).toBe(
          '-(abcd)',
          {
            a: { type: FORMS_FORM_CHANGE, controlRef: undefined },
            b: {
              type: FORMS_ASYNC_VALIDATE_CONTROL,
              controlRef: [],
            },
            c: {
              type: FORMS_ASYNC_VALIDATE_CONTROL,
              controlRef: ['doctorInfo'],
            },
            d: {
              type: FORMS_ASYNC_VALIDATE_CONTROL,
              controlRef: ['doctorInfo', 'type'],
            },
          },
        );
      });
    });

    it('should emit async validation for an added array control and all ancestors', () => {
      testScheduler.run(({ expectObservable, cold }) => {
        const reducer = buildHub1Reducer(cloneDeep(config)) as Reducer<
          BaseForm<Contact>
        >;

        const hub = HubFactory();

        const sourceForHub2$ = buildHub2Source(reducer, hub);

        const action = addControl({
          controlRef: ['emergencyContacts'],
          config: FormBuilder.group({
            validators: [firstNameNotSameAsLast],
            asyncValidators: [uniqueFirstAndLastName],
            controls: {
              firstName: FormBuilder.control(['Barney', required]),
              lastName: FormBuilder.control(['Gumble', required]),
              email: FormBuilder.control([
                'barney@gumble.com',
                [required, email],
                [uniqueEmail, blacklistedEmail],
              ]),
              relation: FormBuilder.control(['astronaut friend', required]),
            },
          }),
        });

        const input$ = cold('-a', {
          a: action,
        });

        subscription = input$.subscribe(hub.dispatch);

        expectObservable(sourceForHub2$.pipe(map(mapTypeAndControlRef))).toBe(
          '-(abcde)',
          {
            a: { type: FORMS_FORM_CHANGE, controlRef: undefined },
            b: {
              type: FORMS_ASYNC_VALIDATE_CONTROL,
              controlRef: [],
            },
            c: {
              type: FORMS_ASYNC_VALIDATE_CONTROL,
              controlRef: ['emergencyContacts'],
            },
            d: {
              type: FORMS_ASYNC_VALIDATE_CONTROL,
              controlRef: ['emergencyContacts', 0],
            },
            e: {
              type: FORMS_ASYNC_VALIDATE_CONTROL,
              controlRef: ['emergencyContacts', 0, 'email'],
            },
          },
        );
      });
    });

    it('should emit async validation when removing a control', () => {
      testScheduler.run(({ expectObservable, cold }) => {
        const clonedConfig = cloneDeep(config);
        (<FormArrayConfig>clonedConfig.controls.emergencyContacts).controls =
          emergencyContactConfigs;

        const reducer = buildHub1Reducer(clonedConfig) as Reducer<
          BaseForm<Contact>
        >;

        const hub = HubFactory();
        const action = removeControl(['emergencyContacts', 0]);

        const sourceForHub2$ = buildHub2Source(reducer, hub);
        const input$ = cold('-a', {
          a: action,
        });

        subscription = input$.subscribe(hub.dispatch);

        expectObservable(sourceForHub2$.pipe(map(mapTypeAndControlRef))).toBe(
          '-(abc)',
          {
            a: { type: FORMS_FORM_CHANGE, controlRef: undefined },
            b: {
              type: FORMS_ASYNC_VALIDATE_CONTROL,
              controlRef: [],
            },
            c: {
              type: FORMS_ASYNC_VALIDATE_CONTROL,
              controlRef: ['emergencyContacts'],
            },
          },
        );
      });
    });

    it('should emit async validation when resetting a control', () => {
      testScheduler.run(({ expectObservable, cold }) => {
        const clonedConfig = cloneDeep(config);
        (<FormArrayConfig>clonedConfig.controls.emergencyContacts).controls =
          emergencyContactConfigs;

        const reducer = buildHub1Reducer(clonedConfig) as Reducer<
          BaseForm<Contact>
        >;

        const hub = HubFactory();
        const action = resetControl(['emergencyContacts', 0]);

        const sourceForHub2$ = buildHub2Source(reducer, hub);
        const input$ = cold('-a', {
          a: action,
        });

        subscription = input$.subscribe(hub.dispatch);

        expectObservable(sourceForHub2$.pipe(map(mapTypeAndControlRef))).toBe(
          '-(abcde)',
          {
            a: { type: FORMS_FORM_CHANGE, controlRef: undefined },
            b: {
              type: FORMS_ASYNC_VALIDATE_CONTROL,
              controlRef: [],
            },
            c: {
              type: FORMS_ASYNC_VALIDATE_CONTROL,
              controlRef: ['emergencyContacts'],
            },
            d: {
              type: FORMS_ASYNC_VALIDATE_CONTROL,
              controlRef: ['emergencyContacts', 0],
            },
            e: {
              type: FORMS_ASYNC_VALIDATE_CONTROL,
              controlRef: ['emergencyContacts', 0, 'email'],
            },
          },
        );
      });
    });
  });
});
