/*
 * Test suite for the Reporters.js module.
 */

'use strict';

const ReporterFactory = require('shared/ReporterFactory.js');

describe('ReporterFactory', () => {
  const ViewProps = {
    x:      0,
    y:      42,
    width:  999,
    height: 1337,
  };
  const View = ReporterFactory(ViewProps);

  test('Builds Reporter classes', () => {
    expect(View.prototype).toHaveProperty('report');
    expect(View.prototype).toHaveProperty('assign');
  });

  describe('Reporter Classes', () => {
    describe('constructor(data)', () => {
      test('correctly constructs expected object', () => {
        let vs;
        expect(() => vs = new View()).not.toThrow();
        expect(vs).toBeInstanceOf(View);
      });

      test('produces expected properties when no data provided', () => {
        const vs = new View();
        expect(vs).toMatchObject(ViewProps);
      });

      test('uses provided data', () => {
        const props = { x: 100, y: 200, width: 333, height: 213 };
        const vs = new View(props);
        expect(vs).toMatchObject(props);
      });

      test('Allows additional properties to be assigned', () => {
        const vs = new View({ z: 100 });
        expect(vs).toMatchObject(ViewProps);
        expect(vs.z).toBe(100);
      });
    });

    describe('assign(data)', () => {
      const vs = new View();

      test('assigns data', () => {
        expect(vs.x).not.toBe(100);
        vs.assign({ x: 100 });
        expect(vs.x).toBe(100);
      });

      test('reassigns data', () => {
        expect(vs.x).toBe(100);
        vs.assign({ x: 2 });
        expect(vs.x).toBe(2);
      });

      test('does not assign data that is not a core property', () => {
        expect(vs).not.toHaveProperty('z');
        vs.assign({ z: 100 });
        expect(vs).not.toHaveProperty('z');
      });

      test('only affects assigned properties', () => {
        expect(vs.x).toBe(2);
        expect(vs.y).not.toBe(1);
        vs.assign({ y: 1 });
        expect(vs.x).toBe(2);
        expect(vs.y).toBe(1);
      });
    });

    describe('report()', () => {
      const props = { x: 100, y: 50, width: 200, height: 300 };
      const vs = new View(props);
      test('reports data', () => {
        const data = vs.report();
        expect(data).toMatchObject(props);
      });

      test('does not report an ID if none exists on the object', () => {
        const data = vs.report();
        expect(data).not.toHaveProperty('id');
      });

      test('reports an immutable ID if one exists on the object', () => {
        vs.id = 1;
        const data = vs.report();
        expect(data).toHaveProperty('id');
        expect(data.id).toBe(1);
        expect(data).toHaveImmutableProperty('id');
      });
    });
  });
});

