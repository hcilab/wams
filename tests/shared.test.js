'use strict';

/*
 * This file is intented to be used for testing the shared module. It will test
 * the module on the server side.
 *
 * TODO: Open up a server once tests are complete for testing code on the
 *  client side.
 */

/*
 * Routines to test:
 *   + makeOwnPropertyImmutable,
 *   + initialize,
 *   + IDStamper,
 *   + ViewSpace,
 *   + Item,
 */
const shared = require('../src/shared.js');

expect.extend({
  toHaveImmutableProperty(received, argument) {
    const descs = Object.getOwnPropertyDescriptor(received, argument);
    const pass = Boolean(descs && !(descs.configurable || descs.writable));
    const not = pass ? 'not ' : ''
    return {
      message: () =>
        `expected ${received} ${not}to have immutable property '${argument}'`,
      pass: pass,
    };
  },
});

describe('makeOwnPropertyImmutable', () => {
  test('makes own enumerable, configurable property immutable', () => {
    const x = {id: 1};
    expect(x).not.toHaveImmutableProperty('id');
    expect(shared.makeOwnPropertyImmutable(x, 'id')).toBe(x);
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

    shared.makeOwnPropertyImmutable(y, 'id');
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

    shared.makeOwnPropertyImmutable(q, 'a');
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
    shared.makeOwnPropertyImmutable(x, 'a');
    expect(x).toHaveImmutableProperty('a');
  });
});

describe('initialize', () => {
  test('does not throw exceptions on empty objects', () => {
    expect(shared.initialize()).toEqual({});
  });

  test('returns empty if defaults is empty, regardless of data', () => {
    expect(shared.initialize({},{})).toEqual({});
    expect(shared.initialize({})).toEqual({});
    expect(shared.initialize({},{a:1})).toEqual({});
    expect(shared.initialize({},1)).toEqual({});
  });

  test('Uses defaults if data is empty.', () => {
    expect(shared.initialize({a:1})).toEqual({a:1});
    expect(shared.initialize({a:1},{})).toEqual({a:1});
  });

  test('Overrides default property if data has property with same name', () => {
    expect(shared.initialize({a:1}, {a:2})).toEqual({a:2});
  });
});

describe('IDStamper', () => {
  describe('constructor()', () => {
    test('correctly constructs expected object', () => {
      const stamper = new shared.IDStamper();
      expect(stamper).toBeInstanceOf(shared.IDStamper);
      expect(stamper).toHaveProperty('stamp');
    });

  });

  describe('stamp(obj)', () => {
    const stamper = new shared.IDStamper();

    test('can stamp an immutable ID onto an object', () => {
      const x = {};
      expect(x).not.toHaveImmutableProperty('id');

      const id = stamper.stamp(x);
      expect(id).toBeGreaterThanOrEqual(0);
      expect(x.id).toBeGreaterThanOrEqual(0);
      expect(x.id).toBe(id);
      expect(x).toHaveImmutableProperty('id');
    });

    test('cannot restamp an object', () => {
      const x = {};
      const id = stamper.stamp(x);
      expect( () => stamper.stamp(x) ).toThrow();
    });

    test('does not reuse IDs', () => {
      const x = {};
      const y = {};
      stamper.stamp(x);
      stamper.stamp(y);
      expect(x.id).not.toBe(y.id);
    });
  });

  describe('stamp(obj, id)', () => {
    const stamper = new shared.IDStamper();

    test('will stamp an immutable user-provided ID', () => {
      const x = {};
      expect(x).not.toHaveImmutableProperty('id');

      const id = 1;
      const out = stamper.stamp(x, id);
      expect(out).toBe(id);
      expect(x).toHaveImmutableProperty('id');
    });
  });
});

describe('ViewSpace', () => {
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
      const vs = new shared.ViewSpace();
      expect(vs).toBeInstanceOf(shared.ViewSpace);
      expect(vs).toHaveProperty('assign');
      expect(vs).toHaveProperty('report');
    });

    test('produces expected properties when no data provided', () => {
      const vs = new shared.ViewSpace();
      expect(Object.keys(vs)).toEqual(props);
    });

    test('uses provided data', () => {
      const vs = new shared.ViewSpace({x:100, y:100, rotation: 90});
      expect(Object.keys(vs)).toEqual(props);
      expect(vs.x).toBe(100);
      expect(vs.y).toBe(100);
      expect(vs.rotation).toBe(90);
      expect(vs.width).toBeNull();
      expect(vs.scale).toBeNull();
    });

    test('does not use incorrect property names in data', () => {
      const vs = new shared.ViewSpace({x: 100, y:100, z:100});
      expect(Object.keys(vs)).toEqual(props);
      expect(vs.x).toBe(100);
      expect(vs.y).toBe(100);
      expect(vs).not.toHaveProperty('z');
    });
  });

  describe('assign(data)', () => {
    const vs = new shared.ViewSpace();

    test('throws exception if no data passed', () => {
      expect(() => vs.assign()).toThrow(); 
    });

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
    const vs = new shared.ViewSpace({x:100, y:50, width:200, height:300});
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

describe('Item', () => {
  const props = [
    'x',
    'y',
    'width',
    'height',
    'type',
    'imgsrc',
    'drawCustom',
    'drawStart',
  ];

  describe('constructor(data)', () => {
    test('correctly constructs expected object', () => {
      const vs = new shared.Item();
      expect(vs).toBeInstanceOf(shared.Item);
      expect(vs).toHaveProperty('assign');
      expect(vs).toHaveProperty('report');
    });

    test('produces expected properties when no data provided', () => {
      const vs = new shared.Item();
      expect(Object.keys(vs)).toEqual(props);
    });

    test('uses provided data', () => {
      const vs = new shared.Item({x:100, y:100, imgsrc: 'a'});
      expect(Object.keys(vs)).toEqual(props);
      expect(vs.x).toBe(100);
      expect(vs.y).toBe(100);
      expect(vs.imgsrc).toBe('a');
      expect(vs.width).toBeNull();
      expect(vs.height).toBeNull();
    });

    test('does not use incorrect property names in data', () => {
      const vs = new shared.Item({x: 100, y:100, z:100});
      expect(Object.keys(vs)).toEqual(props);
      expect(vs.x).toBe(100);
      expect(vs.y).toBe(100);
      expect(vs).not.toHaveProperty('z');
    });
  });

  describe('assign(data)', () => {
    const vs = new shared.Item();

    test('throws exception if no data passed', () => {
      expect(() => vs.assign()).toThrow(); 
    });

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
    const vs = new shared.Item({x:100, y:50, width:200, height:300});
    test('reports data', () => {
      const data = vs.report();
      expect(Object.keys(data)).toEqual(props);
      expect(data.x).toBe(100);
      expect(data.y).toBe(50);
      expect(data.width).toBe(200);
      expect(data.height).toBe(300);
      expect(data.imgsrc).toBeNull();
    });

    test('does not report an ID if none exists on the item', () => {
      const data = vs.report();
      expect(data).not.toHaveProperty('id');
    });

    test('reports an immutable ID if one exists on the item', () => {
      vs.id = 1;
      const data = vs.report();
      expect(data).toHaveProperty('id');
      expect(data.id).toBe(1);
      expect(data).toHaveImmutableProperty('id');
    });
  });
});

