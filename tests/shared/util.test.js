/*
 * Test suite for util.js
 */

'use strict';

const { 
  combine,
  getInitialValues,
  makeOwnPropertyImmutable,
  removeById,
} = require('../../src/shared/util.js');

describe('combine(objects)', () => {
  test('If given a single object, returns a matching object', () => {
    const x = {a: 42, blue: 'red'};
    expect(combine([x])).toMatchObject(x);
  });

  test('Combines two or more objects', () => {
    const x = {a: 42, blue: 'red'};
    const y = {b: 93, red: 'why'};
    const expected = { a: 42, blue: 'red', b: 93, red: 'why'};
    expect(combine([x,y])).toMatchObject(expected);
  });
});


describe('defineOwnImmutableEnumerableProperty(obj, prop, val)', () => {
});

describe('findLast(array, callback, fromIndex, thisArg)', () => {
});

describe('getInitialValues(default, data)', () => {
  test('does not throw exceptions on empty objects', () => {
    expect(getInitialValues()).toEqual({});
  });

  test('returns empty if defaults is empty, regardless of data', () => {
    expect(getInitialValues({},{})).toEqual({});
    expect(getInitialValues({})).toEqual({});
    expect(getInitialValues({},{a:1})).toEqual({});
    expect(getInitialValues({},1)).toEqual({});
  });

  test('Uses defaults if data is empty.', () => {
    expect(getInitialValues({a:1})).toEqual({a:1});
    expect(getInitialValues({a:1},{})).toEqual({a:1});
  });

  test('Overrides default property if data has property with same name', () => {
    expect(getInitialValues({a:1}, {a:2})).toEqual({a:2});
  });
});

describe('makeOwnPropertyImmutable(obj, prop)', () => {
  test('makes own enumerable, configurable property immutable', () => {
    const x = {id: 1};
    expect(x).not.toHaveImmutableProperty('id');
    expect(makeOwnPropertyImmutable(x, 'id')).toBe(x);
    expect(() => delete x.id).toThrow();
    expect(
      () => Object.defineProperty(x, 'id', {configurable: true})
    ).toThrow();
    expect(x).toHaveImmutableProperty('id');
  });

  test('does not affect non-configurable properties', () => {
    const y = {};
    Object.defineProperty(y, 'id', {
      value:1, 
      configurable: false, 
      writable: true,
      enumerable: true,
    });
    expect(y.id).toBe(1);

    makeOwnPropertyImmutable(y, 'id');
    expect(y).not.toHaveImmutableProperty('id');

    y.id = 2;
    expect(y.id).toBe(2);
  });

  test('does not affect non-own properties', () => {
    const p = {a: 1};
    const q = Object.create(p);
    expect(q.a).toBe(1);
    expect(q).not.toHaveImmutableProperty('a');
    expect(p).not.toHaveImmutableProperty('a');

    makeOwnPropertyImmutable(q, 'a');
    expect(q).not.toHaveImmutableProperty('a');
    expect(p).not.toHaveImmutableProperty('a');
    p.a = 2;
    expect(q.a).toBe(2);
  });

  test('does affect non-enumerable properties', () => {
    const x = {};
    Object.defineProperty(x, 'a', {
      value: 1,
      enumerable: false,
      writable: true,
      configurable: true
    });
    expect(x.a).toBe(1);

    expect(x).not.toHaveImmutableProperty('a');
    makeOwnPropertyImmutable(x, 'a');
    expect(x).toHaveImmutableProperty('a');
  });
});

describe('removeById(array, item)', () => {
  function A(id) {
    this.id = id;
  }
  
  let arr = [];
  beforeEach(() => {
    arr.splice(0, arr.length);
    arr.push(new A(1));
    arr.push(new A(2));
    arr.push(new A(3));
  });

  test('Throws exception if not passed an array.', () => {
    expect(() => removeById()).toThrow();
    expect(() => removeById({})).toThrow();
  });

  test('Removes the item with the corresponding Id, if present', () => {
    const a1 = new A(1);
    const a2 = new A(2);
    const a3 = new A(3);
    expect(arr.length).toBe(3);
    expect(() => removeById(arr,a1)).not.toThrow();
    expect(arr.find(a => a.id === 1)).toBeUndefined();
    expect(() => removeById(arr,a2)).not.toThrow();
    expect(arr.find(a => a.id === 2)).toBeUndefined();
    expect(() => removeById(arr,a3)).not.toThrow();
    expect(arr.find(a => a.id === 3)).toBeUndefined();
    expect(arr.length).toBe(0);
  });

  test('Does not remove any item if no item with Id present.', () => {
    const a4 = new A(4);
    expect(arr.length).toBe(3);
    expect(() => removeById(arr,a4)).not.toThrow();
    expect(arr.length).toBe(3);
  });
});

describe('safeRemoveById(array, item, class_fn)', () => {
});

