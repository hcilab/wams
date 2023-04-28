'use strict';

const Lockable = require('mixins/Lockable.js');

class TestArray extends Lockable(Array) {}

describe('Lockable', () => {
  describe('constructor', () => {
    test('passes arguments to the superclass constructor', () => {
      const obj = new TestArray('there', 42);
      expect(obj[0]).toBe('there');
      expect(obj[1]).toBe(42);
    });

    test('"instanceof" operator works', () => {
      const obj = new TestArray(4, 5, 6);
      expect(obj instanceof Array).toBe(true);
      expect(obj instanceof TestArray).toBe(true);
      expect(global.getPrototypeChainNamesOf(obj)).toContain('Lockable');
    });
  });

  describe('Instance Methods', () => {
    let tarr;
    beforeEach(() => {
      tarr = new TestArray(42, 'hi', { x: 1 });
    });

    describe('isLocked()', () => {
      test('Returns falsy initially', () => {
        expect(tarr.isLocked()).toBeFalsy();
      });

      test('Returns truthy when the item is locked', () => {
        tarr.lock();
        expect(tarr.isLocked()).toBeTruthy();
      });
    });

    describe('lock(locker)', () => {
      test('Locks the item', () => {
        tarr.lock();
        expect(tarr.isLocked()).toBeTruthy();
      });
    });

    describe('unlock()', () => {
      test('Unlocks the item', () => {
        tarr.lock();
        expect(tarr.isLocked()).toBeTruthy();
        tarr.unlock();
        expect(tarr.isLocked()).toBeFalsy();
      });
    });
  });
});
