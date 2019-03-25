/*
 * Test suite for shared/utilities.js
 */

'use strict';

const { 
  defineOwnImmutableEnumerableProperty,
  removeById,
} = require('../../src/shared/utilities.js');

describe('defineOwnImmutableEnumerableProperty(obj, prop, val)', () => {
  const x = {};
  test('throws if obj is not a valid object', () => {
    expect(() => defineOwnImmutableEnumerableProperty(undefined, 'a', 1))
      .toThrow();
  });

  test('Does not throw if obj is valid', () => {
    expect(() => defineOwnImmutableEnumerableProperty(x, 'a', 1))
      .not.toThrow();
  });

  test('defines an immutable property on an object', () => {
    expect(x).toHaveImmutableProperty('a');
  }); 

  test('defines an enumerable property on an object', () => {
    expect(Object.keys(x)).toContain('a');
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

