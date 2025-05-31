import { Action } from '@reactables/core';
import { build, group, array, control } from '../RxForm';
import { Subscription, Observable } from 'rxjs';
import { map, delay } from 'rxjs/operators';
import { TestScheduler } from 'rxjs/testing';

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

  describe('custom reducers', () => {
    const addressSearchConfig = ({ streetAddress, city } = { streetAddress: '', city: '' }) =>
      group({
        controls: {
          streetAddress: control([streetAddress]),
          city: control([city]),
        },
      });

    const nameSearchConfig = ({ firstName, lastName } = { firstName: '', lastName: '' }) =>
      group({
        controls: {
          firstName: control([firstName]),
          lastName: control([lastName]),
        },
      });

    it('custom toggleSearchType reducer should toggle controls, and update values for a group control', () => {
      testScheduler.run(({ expectObservable, cold }) => {
        const [state$, actions] = build(
          group({
            controls: {
              searchTypeOne: control(['']),
            },
          }),
          {
            reducers: {
              toggleSearchType: ({ addControl, removeControl, updateValues }, state) => {
                const { form } = state;

                if (form.searchTypeOne) {
                  state = updateValues(state, { controlRef: ['searchTypeOne'], value: 'Hello' });
                  state = removeControl(state, ['searchTypeOne']);
                  state = addControl(state, {
                    controlRef: ['searchTypeTwo'],
                    config: control(['hello wo']),
                  });
                  state = updateValues(state, {
                    controlRef: ['searchTypeTwo'],
                    value: 'HelloTrhee',
                  });
                } else {
                  state = removeControl(state, ['searchTypeTwo']);
                  state = addControl(state, {
                    controlRef: ['searchTypeOne'],
                    config: control(['']),
                  });
                  state = updateValues(state, {
                    controlRef: [],
                    value: { searchTypeOne: 'group changed test!' },
                  });
                  state = updateValues(state, {
                    controlRef: ['searchTypeOne'],
                    value: 'Hello in new one',
                  });
                }

                return state;
              },
            },
          },
        );
        subscription = cold('-bc', {
          b: actions.toggleSearchType,
          c: actions.toggleSearchType,
        }).subscribe((action) => {
          action();
        });

        expectObservable(state$).toBe('abc', {
          a: {
            root: { value: { searchTypeOne: '' } },
            searchTypeOne: { value: '' },
          },
          b: {
            root: { value: { searchTypeTwo: 'HelloTrhee' } },
            searchTypeTwo: { value: 'HelloTrhee' },
          },
          c: {
            root: { value: { searchTypeOne: 'Hello in new one' } },
            searchTypeOne: { value: 'Hello in new one' },
          },
        });
      });
    });

    it('custom toggleSearchType should work on array items', () => {
      testScheduler.run(({ expectObservable, cold }) => {
        const [state$, actions] = build(
          group({
            controls: {
              searchItems: array({
                controls: [
                  group({
                    controls: {
                      addressSearch: addressSearchConfig({
                        streetAddress: '123 any street',
                        city: 'Toronto',
                      }),
                    },
                  }),
                  group({
                    controls: {
                      addressSearch: addressSearchConfig({
                        streetAddress: '123 second street',
                        city: 'Houston',
                      }),
                    },
                  }),
                  group({
                    controls: {
                      nameSearch: nameSearchConfig({ firstName: 'Homer', lastName: 'Simpson' }),
                    },
                  }),
                ],
              }),
            },
          }),
          {
            reducers: {
              toggleSearchType: ({ removeControl, addControl }, state, action: Action<number>) => {
                const { form } = state;

                if (form[`searchItems.${action.payload}.addressSearch`]) {
                  state = removeControl(state, ['searchItems', action.payload, 'addressSearch']);
                  state = addControl(state, {
                    controlRef: ['searchItems', action.payload, 'nameSearch'],
                    config: nameSearchConfig(),
                  });
                } else {
                  state = removeControl(state, ['searchItems', action.payload, 'nameSearch']);
                  state = addControl(state, {
                    controlRef: ['searchItems', action.payload, 'addressSearch'],
                    config: addressSearchConfig(),
                  });
                }

                return state;
              },
            },
          },
        );

        subscription = cold('-bcdefghi', {
          b: () => actions.toggleSearchType(1),
          c: () => actions.toggleSearchType(2),
          d: () =>
            actions.updateValues({
              controlRef: ['searchItems', 1, 'nameSearch'],
              value: { firstName: 'new', lastName: 'guy' },
            }),
          e: () =>
            actions.updateValues({
              controlRef: ['searchItems', 2, 'addressSearch'],
              value: { streetAddress: 'new street', city: 'new city' },
            }),
          f: () => actions.removeControl(['searchItems', 0]),
          g: () => actions.toggleSearchType(0),
          h: () =>
            actions.updateValues({
              controlRef: ['searchItems', 0, 'addressSearch'],
              value: { streetAddress: 'final street', city: 'final city' },
            }),
          i: () =>
            actions.updateValues({
              controlRef: ['searchItems', 1, 'addressSearch'],
              value: { streetAddress: 'next final street', city: 'next final city' },
            }),
        }).subscribe((action) => {
          action();
        });

        expectObservable(state$).toBe('abcdefghi', {
          // Initialized State
          a: {
            root: {
              value: {
                searchItems: [
                  {
                    addressSearch: {
                      streetAddress: '123 any street',
                      city: 'Toronto',
                    },
                  },
                  {
                    addressSearch: {
                      streetAddress: '123 second street',
                      city: 'Houston',
                    },
                  },
                  {
                    nameSearch: {
                      firstName: 'Homer',
                      lastName: 'Simpson',
                    },
                  },
                ],
              },
            },
            'searchItems.0': {
              value: {
                addressSearch: {
                  streetAddress: '123 any street',
                  city: 'Toronto',
                },
              },
            },
            'searchItems.1': {
              value: {
                addressSearch: {
                  streetAddress: '123 second street',
                  city: 'Houston',
                },
              },
            },
            'searchItems.2': {
              value: {
                nameSearch: {
                  firstName: 'Homer',
                  lastName: 'Simpson',
                },
              },
            },
          },
          // Toggle search type for control 1
          b: {
            'searchItems.1': {
              value: {
                nameSearch: {
                  firstName: '',
                  lastName: '',
                },
              },
            },
          },
          // Toggle search type for control 2
          c: {
            'searchItems.1': {
              value: {
                nameSearch: {
                  firstName: '',
                  lastName: '',
                },
              },
            },
            'searchItems.2': {
              value: {
                addressSearch: {
                  streetAddress: '',
                  city: '',
                },
              },
            },
          },
          // Update searchItems.1.nameSearch
          d: {
            'searchItems.1': {
              value: {
                nameSearch: {
                  firstName: 'new',
                  lastName: 'guy',
                },
              },
            },
          },
          // Update searchItems.2.addressSearch
          e: {
            'searchItems.2': {
              value: {
                addressSearch: {
                  streetAddress: 'new street',
                  city: 'new city',
                },
              },
            },
          },
          // Remove searchItems.0
          f: {
            root: {
              value: {
                searchItems: [
                  {
                    nameSearch: {
                      firstName: 'new',
                      lastName: 'guy',
                    },
                  },
                  {
                    addressSearch: {
                      streetAddress: 'new street',
                      city: 'new city',
                    },
                  },
                ],
              },
            },
            'searchItems.0': {
              value: {
                nameSearch: {
                  firstName: 'new',
                  lastName: 'guy',
                },
              },
            },
            'searchItems.1': {
              value: {
                addressSearch: {
                  streetAddress: 'new street',
                  city: 'new city',
                },
              },
            },
          },
          // Toggle searchItems.0
          g: {
            root: {
              value: {
                searchItems: [
                  {
                    addressSearch: {
                      streetAddress: '',
                      city: '',
                    },
                  },
                  {
                    addressSearch: {
                      streetAddress: 'new street',
                      city: 'new city',
                    },
                  },
                ],
              },
            },
            'searchItems.0': {
              value: {
                addressSearch: {
                  streetAddress: '',
                  city: '',
                },
              },
            },
            'searchItems.1': {
              value: {
                addressSearch: {
                  streetAddress: 'new street',
                  city: 'new city',
                },
              },
            },
          },
          // Update searchItems.0.addressSearch
          h: {
            root: {
              value: {
                searchItems: [
                  {
                    addressSearch: {
                      streetAddress: 'final street',
                      city: 'final city',
                    },
                  },
                  {
                    addressSearch: {
                      streetAddress: 'new street',
                      city: 'new city',
                    },
                  },
                ],
              },
            },
            'searchItems.0': {
              value: {
                addressSearch: {
                  streetAddress: 'final street',
                  city: 'final city',
                },
              },
            },
            'searchItems.1': {
              value: {
                addressSearch: {
                  streetAddress: 'new street',
                  city: 'new city',
                },
              },
            },
          },
          // Update searchItems.1.addressSearch
          i: {
            root: {
              value: {
                searchItems: [
                  {
                    addressSearch: {
                      streetAddress: 'final street',
                      city: 'final city',
                    },
                  },
                  {
                    addressSearch: {
                      streetAddress: 'next final street',
                      city: 'next final city',
                    },
                  },
                ],
              },
            },
            'searchItems.0': {
              value: {
                addressSearch: {
                  streetAddress: 'final street',
                  city: 'final city',
                },
              },
            },
            'searchItems.1': {
              value: {
                addressSearch: {
                  streetAddress: 'next final street',
                  city: 'next final city',
                },
              },
            },
          },
        });
      });
    });

    it('reindexReducer should reindex items and preserve updated values', () => {
      testScheduler.run(({ expectObservable, cold }) => {
        const [state$, actions] = build(
          group({
            controls: {
              searchItems: array({
                controls: [
                  group({
                    controls: {
                      nameSearch: nameSearchConfig({
                        firstName: 'firstName 1',
                        lastName: 'lastName 1',
                      }),
                    },
                  }),
                  group({
                    controls: {
                      nameSearch: nameSearchConfig({
                        firstName: 'firstName 2',
                        lastName: 'lastName 2',
                      }),
                    },
                  }),
                  group({
                    controls: {
                      nameSearch: nameSearchConfig({
                        firstName: 'firstName 3',
                        lastName: 'lastName 3',
                      }),
                    },
                  }),
                  group({
                    controls: {
                      nameSearch: nameSearchConfig({
                        firstName: 'firstName 4',
                        lastName: 'lastName 4',
                      }),
                    },
                  }),
                ],
              }),
            },
          }),
          {
            reducers: {
              reindexReducer: ({ removeControl, updateValues }, state) => {
                state = updateValues(state, {
                  controlRef: ['searchItems', 1, 'nameSearch', 'firstName'],
                  value: 'firstName 2 changed',
                });

                state = updateValues(state, {
                  controlRef: ['searchItems', 3, 'nameSearch', 'firstName'],
                  value: 'firstName 4 changed',
                });

                state = removeControl(state, ['searchItems', 2]);

                return state;
              },
            },
          },
        );

        subscription = cold('-b', {
          b: actions.reindexReducer,
        }).subscribe((action) => {
          action();
        });

        expectObservable(state$).toBe('ab', {
          a: {
            root: {
              value: {
                searchItems: [
                  { nameSearch: { firstName: 'firstName 1', lastName: 'lastName 1' } },
                  { nameSearch: { firstName: 'firstName 2', lastName: 'lastName 2' } },
                  { nameSearch: { firstName: 'firstName 3', lastName: 'lastName 3' } },
                  { nameSearch: { firstName: 'firstName 4', lastName: 'lastName 4' } },
                ],
              },
            },
          },
          b: {
            root: {
              value: {
                searchItems: [
                  { nameSearch: { firstName: 'firstName 1', lastName: 'lastName 1' } },
                  { nameSearch: { firstName: 'firstName 2 changed', lastName: 'lastName 2' } },
                  { nameSearch: { firstName: 'firstName 4 changed', lastName: 'lastName 4' } },
                ],
              },
            },
            'searchItems.0.nameSearch.firstName': { value: 'firstName 1' },
            'searchItems.1.nameSearch.firstName': { value: 'firstName 2 changed' },
            'searchItems.2.nameSearch.firstName': { value: 'firstName 4 changed' },
          },
        });
      });
    });

    it('should run effect on a custom reducer', () => {
      testScheduler.run(({ expectObservable, cold }) => {
        const [state$, actions, actions$] = build(
          group({
            controls: {
              testControl: control([false]),
            },
          }),
          {
            reducers: {
              changeControl: {
                reducer: ({ updateValues }, state, { payload }: Action<boolean>) => {
                  return updateValues(state, { controlRef: ['testControl'], value: payload });
                },
                effects: [
                  (controlType$: Observable<Action<boolean>>) =>
                    controlType$.pipe(
                      map(({ payload }) => ({ type: 'handleControlChange', payload })),
                      delay(1),
                    ),
                ],
              },
              handleControlChange: ({ addControl }, state, { payload }: Action<boolean>) => {
                if (payload) {
                  return addControl(state, {
                    controlRef: ['trueControl'],
                    config: control([true]),
                  });
                } else {
                  return addControl(state, {
                    controlRef: ['falseControl'],
                    config: control([false]),
                  });
                }
              },
            },
          },
        );

        expect(actions$.types).toEqual({
          handleControlChange: 'handleControlChange',
          changeControl: 'changeControl',
          updateValues: 'updateValues',
          addControl: 'addControl',
          pushControl: 'pushControl',
          removeControl: 'removeControl',
          markControlAsPristine: 'markControlAsPristine',
          markControlAsTouched: 'markControlAsTouched',
          markControlAsUntouched: 'markControlAsUntouched',
          resetControl: 'resetControl',
        });

        subscription = cold('-b-c', {
          b: () => actions.changeControl(true),
          c: () => actions.changeControl(false),
        }).subscribe((action) => {
          action();
        });

        expectObservable(state$).toBe('abcde', {
          a: {
            root: { value: { testControl: false } },
            testControl: { value: false },
          },
          b: {
            root: { value: { testControl: true } },
            testControl: { value: true },
          },
          c: {
            root: { value: { testControl: true, trueControl: true } },
            testControl: { value: true },
            trueControl: { value: true },
          },
          d: {
            root: { value: { testControl: false, trueControl: true } },
            testControl: { value: false },
            trueControl: { value: true },
          },
          e: {
            root: { value: { testControl: false, trueControl: true, falseControl: false } },
            testControl: { value: false },
            trueControl: { value: true },
            falseControl: { value: false },
          },
        });
      });
    });
  });
});
