/*
 * Test suite for util.js
 */

'use strict';

const { 
  defineOwnImmutableEnumerableProperty,
  findLast,
  mergeMatches,
  makeOwnPropertyImmutable,
  removeById,
  safeRemoveById,
} = require('../../src/shared/util.js');

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

describe('findLast(array, callback, fromIndex, thisArg)', () => {
  const arr = [1,'b',2,3,'a',4];
  const self = {
    x: 3,
    c: 'a',
  };

  test('Finds the last item in the array that satisfies the callback', () => {
    expect(findLast(arr, e => e % 2 === 0)).toBe(4);
    expect(findLast(arr, e => typeof e === 'string')).toBe('a');
    expect(findLast(arr, e => e % 2 === 1)).toBe(3);
    expect(findLast(arr, e => e < 3)).toBe(2);
  });
  
  test('Starts from fromIndex, if provided', () => {
    expect(findLast(arr, e => e % 2 === 0, 3)).toBe(2);
    expect(findLast(arr, e => typeof e === 'string', 3)).toBe('b');
    expect(findLast(arr, e => e % 2 === 1, 2)).toBe(1);
    expect(findLast(arr, e => e < 3, 1)).toBe(1);
  });
  
  test('Uses thisArg, if provided', () => {
    function cbx(e) { return this.x === e; };
    function cba(e) { return this.c === e; };
    expect(findLast(arr, cbx, undefined, self)).toBe(3);
    expect(findLast(arr, cba, undefined, self)).toBe('a');
  });
  
  test('Passes all the expected values to the callback', () => {
    const cb = jest.fn();
    cb.mockReturnValue(true);
    expect(() => findLast(arr, cb)).not.toThrow();
    expect(cb).toHaveBeenCalledTimes(1);
    expect(cb).toHaveBeenLastCalledWith(4,5,arr);

    const cc = jest.fn();
    cc.mockReturnValue(false);
    expect(() => findLast(arr, cc)).not.toThrow();
    expect(cc).toHaveBeenCalledTimes(6);
    expect(cc).toHaveBeenLastCalledWith(1,0, arr);
  });
});

describe('mergeMatches(default, data)', () => {
  test('does not throw exceptions on empty objects', () => {
    expect(mergeMatches()).toEqual({});
  });

  test('returns empty if defaults is empty, regardless of data', () => {
    expect(mergeMatches({},{})).toEqual({});
    expect(mergeMatches({})).toEqual({});
    expect(mergeMatches({},{a:1})).toEqual({});
    expect(mergeMatches({},1)).toEqual({});
  });

  test('Uses defaults if data is empty.', () => {
    expect(mergeMatches({a:1})).toEqual({a:1});
    expect(mergeMatches({a:1},{})).toEqual({a:1});
  });

  test('Overrides default property if data has property with same name', () => {
    expect(mergeMatches({a:1}, {a:2})).toEqual({a:2});
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
  
  test('Removes the item with the corresponding Id, if present', () => {
    const a1 = new A(1);
    const a2 = new A(2);
    const a3 = new A(3);
    expect(arr.length).toBe(3);
    expect(() => safeRemoveById(arr,a1, A)).not.toThrow();
    expect(arr.find(a => a.id === 1)).toBeUndefined();
    expect(() => safeRemoveById(arr,a2, A)).not.toThrow();
    expect(arr.find(a => a.id === 2)).toBeUndefined();
    expect(() => safeRemoveById(arr,a3, A)).not.toThrow();
    expect(arr.find(a => a.id === 3)).toBeUndefined();
    expect(arr.length).toBe(0);
  });

  test('Does not remove any item if no item with Id present.', () => {
    const a4 = new A(4);
    expect(arr.length).toBe(3);
    expect(() => safeRemoveById(arr,a4, A)).not.toThrow();
    expect(arr.length).toBe(3);
  });
  
  test('Throws an exception if item is not the proper type', () => {
    const x = {id:3};
    expect(arr.length).toBe(3);
    expect(() => safeRemoveById(arr,x, A)).toThrow();
    expect(arr.length).toBe(3);
  });
});

