'use strict';

/*
 * This file is intented to be used for testing the WamsShared module. It will test
 * the module on the server side.
 *
 * TODO: Open up a server once tests are complete for testing code on the
 *  client side.
 */

/*
 * Routines to test:
 *   + makeOwnPropertyImmutable,
 *   + getInitialValues,
 *   + IdStamper,
 *   + View,
 *   + Item,
 */
const WamsShared = require('../src/shared.js');
const IdStamper = WamsShared.IdStamper;
const Message = WamsShared.Message;
const View = WamsShared.View;
const Item = WamsShared.Item;

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
      const vs = new WamsShared.View();
      expect(vs).toBeInstanceOf(WamsShared.View);
    });

    test('produces expected properties when no data provided', () => {
      const vs = new WamsShared.View();
      expect(Object.keys(vs)).toEqual(props);
    });

    test('uses provided data', () => {
      const vs = new WamsShared.View({x:100, y:100, rotation: 90});
      expect(Object.keys(vs)).toEqual(props);
      expect(vs.x).toBe(100);
      expect(vs.y).toBe(100);
      expect(vs.rotation).toBe(90);
      expect(vs.width).toBeNull();
      expect(vs.scale).toBeNull();
    });

    test('does not use incorrect property names in data', () => {
      const vs = new WamsShared.View({x: 100, y:100, z:100});
      expect(Object.keys(vs)).toEqual(props);
      expect(vs.x).toBe(100);
      expect(vs.y).toBe(100);
      expect(vs).not.toHaveProperty('z');
    });
  });

  describe('assign(data)', () => {
    const vs = new WamsShared.View();

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
    const vs = new WamsShared.View({x:100, y:50, width:200, height:300});
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
      const vs = new WamsShared.Item();
      expect(vs).toBeInstanceOf(WamsShared.Item);
      expect(vs).toHaveProperty('assign');
      expect(vs).toHaveProperty('report');
    });

    test('produces expected properties when no data provided', () => {
      const vs = new WamsShared.Item();
      expect(Object.keys(vs)).toEqual(props);
    });

    test('uses provided data', () => {
      const vs = new WamsShared.Item({x:100, y:100, imgsrc: 'a'});
      expect(Object.keys(vs)).toEqual(props);
      expect(vs.x).toBe(100);
      expect(vs.y).toBe(100);
      expect(vs.imgsrc).toBe('a');
      expect(vs.width).toBeNull();
      expect(vs.height).toBeNull();
    });

    test('does not use incorrect property names in data', () => {
      const vs = new WamsShared.Item({x: 100, y:100, z:100});
      expect(Object.keys(vs)).toEqual(props);
      expect(vs.x).toBe(100);
      expect(vs.y).toBe(100);
      expect(vs).not.toHaveProperty('z');
    });
  });

  describe('assign(data)', () => {
    const vs = new WamsShared.Item();

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
    const vs = new WamsShared.Item({x:100, y:50, width:200, height:300});
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

