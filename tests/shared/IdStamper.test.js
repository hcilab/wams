'use strict';

const IdStamper = require('shared/IdStamper.js');

describe('IdStamper', () => {
  describe('constructor()', () => {
    test('correctly constructs expected object', () => {
      expect(new IdStamper()).toBeInstanceOf(IdStamper);
    });
  });

  describe('Instance Methods', () => {
    let stamper;
    beforeAll(() => {
      stamper = new IdStamper();
    });

    describe('stampNewId(obj)', () => {
      test('can stamp an immutable Id onto an object', () => {
        const x = {};
        expect(x).not.toHaveImmutableProperty('id');

        stamper.stampNewId(x);
        expect(x).toHaveImmutableProperty('id');
        expect(x.id).toBeGreaterThanOrEqual(0);
      });

      test('cannot restamp an object', () => {
        const x = {};
        stamper.stampNewId(x);
        expect(() => stamper.stampNewId(x)).toThrow();
      });

      test('does not reuse Ids', () => {
        const x = {};
        const y = {};
        stamper.stampNewId(x);
        stamper.stampNewId(y);
        expect(x.id).not.toBe(y.id);
      });
    });
  });

  describe('Static Methods', () => {
    describe('cloneId(obj, id)', () => {
      test('will stamp an immutable user-provided Id', () => {
        const x = {};
        const id = 1;
        expect(x).not.toHaveImmutableProperty('id');
        IdStamper.cloneId(x, id);
        expect(x).toHaveImmutableProperty('id');
        expect(x.id).toBe(id);
      });

      test('Will not define an Id if none provided', () => {
        const x = {};
        expect(x).not.toHaveImmutableProperty('id');
        IdStamper.cloneId(x);
        expect(x).not.toHaveImmutableProperty('id');
        IdStamper.cloneId(x, null);
        expect(x).not.toHaveImmutableProperty('id');
        IdStamper.cloneId(x, undefined);
        expect(x).not.toHaveImmutableProperty('id');
        IdStamper.cloneId(x, 'a');
        expect(x).not.toHaveImmutableProperty('id');
        IdStamper.cloneId(x, 2e64);
        expect(x).not.toHaveImmutableProperty('id');
      });
    });
  });
});
