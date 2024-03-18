import diffObjects from './diffObjects';

describe('diffObjects', () => {
  it('new raw value', () => {
    expect(diffObjects({ test: true }, { test: true, test2: true })).toEqual([
      {
        type: 'CREATE',
        path: ['test2'],
        value: true,
      },
    ]);
  });

  it('change raw value', () => {
    expect(diffObjects({ test: true }, { test: false })).toEqual([
      {
        type: 'CHANGE',
        path: ['test'],
        value: false,
        oldValue: true,
      },
    ]);
  });

  it('remove raw value', () => {
    expect(diffObjects({ test: true, test2: true }, { test: true })).toEqual([
      {
        type: 'REMOVE',
        path: ['test2'],
        oldValue: true,
      },
    ]);
  });

  it('replace object with null', () => {
    expect(diffObjects({ object: { test: true } }, { object: null })).toEqual([
      {
        type: 'CHANGE',
        path: ['object'],
        value: null,
        oldValue: { test: true },
      },
    ]);
  });
  it('replace object with other value', () => {
    expect(diffObjects({ object: { test: true } }, { object: 'string' })).toEqual([
      {
        type: 'CHANGE',
        path: ['object'],
        value: 'string',
        oldValue: { test: true },
      },
    ]);
  });
  it('equal null protype objects', () => {
    expect(diffObjects(Object.create(null) as object, Object.create(null) as object)).toEqual([]);
  });

  it('unequal null protype objects', () => {
    const obj1 = Object.create(null) as object;
    const obj2 = Object.create(null) as { test: boolean } & object;
    obj2.test = true;
    expect(diffObjects(obj1, obj2)).toEqual([
      {
        type: 'CREATE',
        path: ['test'],
        value: true,
      },
    ]);
  });

  it('Handles equal string', () => {
    expect(diffObjects({ string: 'hi' }, { string: 'hi' })).toEqual([]);
  });

  it('Handles equal number', () => {
    expect(diffObjects({ number: 1 }, { number: 1 })).toEqual([]);
  });

  it('Handles unequal number', () => {
    expect(diffObjects({ number: 1 }, { number: 2 })).toEqual([
      {
        type: 'CHANGE',
        path: ['number'],
        value: 2,
        oldValue: 1,
      },
    ]);
  });

  // Arrays and nested arrays
  it('top level array & array diff', () => {
    expect(diffObjects(['test', 'testing'], ['test'])).toEqual([
      {
        type: 'REMOVE',
        path: [1],
        oldValue: 'testing',
      },
    ]);
  });

  it('nested array', () => {
    expect(diffObjects(['test', ['test']], ['test', ['test', 'test2']])).toEqual([
      {
        type: 'CREATE',
        path: [1, 1],
        value: 'test2',
      },
    ]);
  });

  it('object in array in object', () => {
    expect(
      diffObjects({ test: ['test', { test: true }] }, { test: ['test', { test: false }] }),
    ).toEqual([
      {
        type: 'CHANGE',
        path: ['test', 1, 'test'],
        value: false,
        oldValue: true,
      },
    ]);
  });
});
