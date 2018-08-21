/*
 * Test suite for the Reporters.js module.
 */

'use strict';

const Reporters = require('../../src/shared/Reporters.js');
const { View, Item } = Reporters;

describe('View', () => {
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

  describe('constructor(data)', () => {
    test('correctly constructs expected object', () => {
      const vs = new View();
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

    test('is chainable', () => {
      expect(vs.y).not.toBe(100);
      expect(vs.width).not.toBe(50);
      expect(
        vs.assign({y:100}).assign({width:50})
      ).toBe(vs);
      expect(vs.y).toBe(100);
      expect(vs.width).toBe(50);
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

    test('does not report an Id if none exists on the object', () => {
      const data = vs.report();
      expect(data).not.toHaveProperty('id');
    });

    test('reports an immutable Id if one exists on the object', () => {
      vs.id = 1;
      const data = vs.report();
      expect(data).toHaveProperty('id');
      expect(data.id).toBe(1);
      expect(data).toHaveImmutableProperty('id');
    });
  });
});

describe('Item', () => {
  const props = [
    'x',
    'y',
    'width',
    'height',
    'type',
    'imgsrc',
    'blueprint',
  ];

  describe('constructor(data)', () => {
    test('correctly constructs expected object', () => {
      const vs = new Item();
      expect(vs).toBeInstanceOf(Item);
      expect(vs).toHaveProperty('assign');
      expect(vs).toHaveProperty('report');
    });

    test('produces expected properties when no data provided', () => {
      const vs = new Item();
      expect(Object.keys(vs)).toEqual(props);
    });

    test('uses provided data', () => {
      const vs = new Item({x:100, y:100, imgsrc: 'a'});
      expect(Object.keys(vs)).toEqual(props);
      expect(vs.x).toBe(100);
      expect(vs.y).toBe(100);
      expect(vs.imgsrc).toBe('a');
      expect(vs.width).toBeNull();
      expect(vs.height).toBeNull();
    });

    test('does not use incorrect property names in data', () => {
      const vs = new Item({x: 100, y:100, z:100});
      expect(Object.keys(vs)).toEqual(props);
      expect(vs.x).toBe(100);
      expect(vs.y).toBe(100);
      expect(vs).not.toHaveProperty('z');
    });
  });

  describe('assign(data)', () => {
    const vs = new Item();

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

    test('is chainable', () => {
      expect(vs.y).not.toBe(100);
      expect(vs.width).not.toBe(50);
      expect(
        vs.assign({y:100}).assign({width:50})
      ).toBe(vs);
      expect(vs.y).toBe(100);
      expect(vs.width).toBe(50);
    });
  });

  describe('report()', () => {
    const vs = new Item({x:100, y:50, width:200, height:300});
    test('reports data', () => {
      const data = vs.report();
      expect(Object.keys(data)).toEqual(props);
      expect(data.x).toBe(100);
      expect(data.y).toBe(50);
      expect(data.width).toBe(200);
      expect(data.height).toBe(300);
      expect(data.imgsrc).toBeNull();
    });

    test('does not report an Id if none exists on the item', () => {
      const data = vs.report();
      expect(data).not.toHaveProperty('id');
    });

    test('reports an immutable Id if one exists on the item', () => {
      vs.id = 1;
      const data = vs.report();
      expect(data).toHaveProperty('id');
      expect(data.id).toBe(1);
      expect(data).toHaveImmutableProperty('id');
    });
  });
});


