/*
 * Test suite for the Reporters.js module.
 */

'use strict';

const ReporterFactory = require('../../src/shared/ReporterFactory.js');

describe('ReporterFactory', () => {
  const props = [
    'x',
    'y',
    'width',
    'height',
    'type',
    'effectiveWidth',
    'effectiveHeight',
    'scale',
    'rotation',
  ];
  const View = ReporterFactory(props);

  test('Builds Reporter classes', () => {
    expect(View.prototype).toHaveProperty('report');
    expect(View.prototype).toHaveProperty('assign');
  })

  describe('Reporter Classes', () => {
    describe('constructor(data)', () => {
      test('correctly constructs expected object', () => {
        let vs 
        expect(() => vs = new View()).not.toThrow();
        expect(vs).toBeInstanceOf(View);
      });

      test('produces expected properties when no data provided', () => {
        const vs = new View();
        expect(Object.keys(vs)).toEqual(props);
      });

      test('uses provided data', () => {
        const vs = new View({x:100, y:100, rotation: 90});
        expect(Object.keys(vs)).toEqual(props);
        expect(vs.x).toBe(100);
        expect(vs.y).toBe(100);
        expect(vs.rotation).toBe(90);
        expect(vs.width).toBeNull();
        expect(vs.scale).toBeNull();
      });

      test('does not use incorrect property names in data', () => {
        const vs = new View({x: 100, y:100, z:100});
        expect(Object.keys(vs)).toEqual(props);
        expect(vs.x).toBe(100);
        expect(vs.y).toBe(100);
        expect(vs).not.toHaveProperty('z');
      });
    });

    describe('assign(data)', () => {
      const vs = new View();

      test('assigns data', () => {
        expect(vs.x).not.toBe(100);
        vs.assign({x:100});
        expect(vs.x).toBe(100);
      });

      test('reassigns data', () => {
        expect(vs.x).toBe(100);
        vs.assign({x:2});
        expect(vs.x).toBe(2);
      });

      test('does not assign data that is not a core property', () => {
        expect(vs).not.toHaveProperty('z');
        vs.assign({z:100});
        expect(vs).not.toHaveProperty('z');
      });

      test('only affects assigned properties', () => {
        expect(vs.x).toBe(2);
        expect(vs.y).not.toBe(1);
        vs.assign({y:1});
        expect(vs.x).toBe(2);
        expect(vs.y).toBe(1);
      });
    });

    describe('report()', () => {
      const vs = new View({x:100, y:50, width:200, height:300});
      test('reports data', () => {
        const data = vs.report();
        expect(Object.keys(data)).toEqual(props);
        expect(data.x).toBe(100);
        expect(data.y).toBe(50);
        expect(data.width).toBe(200);
        expect(data.height).toBe(300);
        expect(data.scale).toBeNull();
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

