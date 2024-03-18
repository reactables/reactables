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
});
