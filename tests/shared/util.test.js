/*
 * Test suite for util.js
 */

'use strict';

const Utils = require('../../src/shared/util.js');

describe('defineOwnImmutableEnumerableProperty(obj, prop, val)', () => {
});

describe('findLast(array, callback, fromIndex, thisArg)', () => {
});

describe('getInitialValues(default, data)', () => {
  test('does not throw exceptions on empty objects', () => {
    expect(Utils.getInitialValues()).toEqual({});
  });

  test('returns empty if defaults is empty, regardless of data', () => {
    expect(Utils.getInitialValues({},{})).toEqual({});
    expect(Utils.getInitialValues({})).toEqual({});
    expect(Utils.getInitialValues({},{a:1})).toEqual({});
    expect(Utils.getInitialValues({},1)).toEqual({});
  });

  test('Uses defaults if data is empty.', () => {
    expect(Utils.getInitialValues({a:1})).toEqual({a:1});
    expect(Utils.getInitialValues({a:1},{})).toEqual({a:1});
  });

  test('Overrides default property if data has property with same name', () => {
    expect(Utils.getInitialValues({a:1}, {a:2})).toEqual({a:2});
  });
});

describe('makeOwnPropertyImmutable(obj, prop)', () => {
  test('makes own enumerable, configurable property immutable', () => {
    const x = {id: 1};
    expect(x).not.toHaveImmutableProperty('id');
    expect(Utils.makeOwnPropertyImmutable(x, 'id')).toBe(x);
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

    Utils.makeOwnPropertyImmutable(y, 'id');
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

    Utils.makeOwnPropertyImmutable(q, 'a');
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
    Utils.makeOwnPropertyImmutable(x, 'a');
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
    expect(() => Utils.removeById()).toThrow();
    expect(() => Utils.removeById({})).toThrow();
  });

  test('Removes the item with the corresponding Id, if present', () => {
    const a1 = new A(1);
    const a2 = new A(2);
    const a3 = new A(3);
    expect(arr.length).toBe(3);
    expect(() => Utils.removeById(arr,a1)).not.toThrow();
    expect(arr.find(a => a.id === 1)).toBeUndefined();
    expect(() => Utils.removeById(arr,a2)).not.toThrow();
    expect(arr.find(a => a.id === 2)).toBeUndefined();
    expect(() => Utils.removeById(arr,a3)).not.toThrow();
    expect(arr.find(a => a.id === 3)).toBeUndefined();
    expect(arr.length).toBe(0);
  });

  test('Does not remove any item if no item with Id present.', () => {
    const a4 = new A(4);
    expect(arr.length).toBe(3);
    expect(() => Utils.removeById(arr,a4)).not.toThrow();
    expect(arr.length).toBe(3);
  });
});

describe('safeRemoveById(array, item, class_fn)', () => {
});

