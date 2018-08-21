/*
 * Test suite for the IdStamper class.
 */

'use strict';

const IdStamper = require('../../src/shared/IdStamper.js');

describe('IdStamper', () => {
  describe('constructor()', () => {
    test('correctly constructs expected object', () => {
      expect(new IdStamper()).toBeInstanceOf(IdStamper);
    });
  });

  describe('stampNewId(obj)', () => {
    const stamper = new IdStamper();

    test('can stamp an immutable Id onto an object', () => {
      const x = {};
      expect(x).not.toHaveImmutableProperty('id');

      stamper.stampNewId(x);
      expect(x).toHaveImmutableProperty('id');
      expect(x.id).toBeGreaterThanOrEqual(0);
    });

    test('cannot restamp an object', () => {
      const x = {};
      const id = stamper.stampNewId(x);
      expect( () => stamper.stampNewId(x) ).toThrow();
    });

    test('does not reuse Ids', () => {
      const x = {};
      const y = {};
      stamper.stampNewId(x);
      stamper.stampNewId(y);
      expect(x.id).not.toBe(y.id);
    });
  });

  describe('cloneId(obj, id)', () => {
    const stamper = new IdStamper();

    test('will stamp an immutable user-provided Id', () => {
      const x = {};
      const id = 1;
      expect(x).not.toHaveImmutableProperty('id');
      stamper.cloneId(x, id);
      expect(x).toHaveImmutableProperty('id');
      expect(x.id).toBe(id);
    });
    
    test('Will not define an Id if none provided', () => {
      const x = {};
      expect(x).not.toHaveImmutableProperty('id');
      stamper.cloneId(x);
      expect(x).not.toHaveImmutableProperty('id');
      stamper.cloneId(x, null);
      expect(x).not.toHaveImmutableProperty('id');
      stamper.cloneId(x, undefined);
      expect(x).not.toHaveImmutableProperty('id');
      stamper.cloneId(x, 'a');
      expect(x).not.toHaveImmutableProperty('id');
      stamper.cloneId(x, 2e64);
      expect(x).not.toHaveImmutableProperty('id');
    });
  });
});

