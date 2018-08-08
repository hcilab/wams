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
 *   + initialize,
 *   + IDStamper,
 *   + Viewer,
 *   + Item,
 */
const WamsShared = require('../src/shared.js');
const IDStamper = WamsShared.IDStamper;
const Message = WamsShared.Message;
const Viewer = WamsShared.Viewer;
const Item = WamsShared.Item;

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

describe('initialize', () => {
  test('does not throw exceptions on empty objects', () => {
    expect(WamsShared.initialize()).toEqual({});
  });

  test('returns empty if defaults is empty, regardless of data', () => {
    expect(WamsShared.initialize({},{})).toEqual({});
    expect(WamsShared.initialize({})).toEqual({});
    expect(WamsShared.initialize({},{a:1})).toEqual({});
    expect(WamsShared.initialize({},1)).toEqual({});
  });

  test('Uses defaults if data is empty.', () => {
    expect(WamsShared.initialize({a:1})).toEqual({a:1});
    expect(WamsShared.initialize({a:1},{})).toEqual({a:1});
  });

  test('Overrides default property if data has property with same name', () => {
    expect(WamsShared.initialize({a:1}, {a:2})).toEqual({a:2});
  });
});

describe('makeOwnPropertyImmutable', () => {
  test('makes own enumerable, configurable property immutable', () => {
    const x = {id: 1};
    expect(x).not.toHaveImmutableProperty('id');
    expect(WamsShared.makeOwnPropertyImmutable(x, 'id')).toBe(x);
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

    WamsShared.makeOwnPropertyImmutable(y, 'id');
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

    WamsShared.makeOwnPropertyImmutable(q, 'a');
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
    WamsShared.makeOwnPropertyImmutable(x, 'a');
    expect(x).toHaveImmutableProperty('a');
  });
});

describe('removeByID(array, item, class_fn)', () => {
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
    expect(() => WamsShared.removeByID()).toThrow();
    expect(() => WamsShared.removeByID({})).toThrow();
  });

  test('Removes the item with the corresponding ID, if present', () => {
    const a1 = new A(1);
    const a2 = new A(2);
    const a3 = new A(3);
    expect(arr.length).toBe(3);
    expect(() => WamsShared.removeByID(arr,a1)).not.toThrow();
    expect(arr.find(a => a.id === 1)).toBeUndefined();
    expect(() => WamsShared.removeByID(arr,a2)).not.toThrow();
    expect(arr.find(a => a.id === 2)).toBeUndefined();
    expect(() => WamsShared.removeByID(arr,a3)).not.toThrow();
    expect(arr.find(a => a.id === 3)).toBeUndefined();
    expect(arr.length).toBe(0);
  });

  test('Does not remove any item if no item with ID present.', () => {
    const a4 = new A(4);
    expect(arr.length).toBe(3);
    expect(() => WamsShared.removeByID(arr,a4)).not.toThrow();
    expect(arr.length).toBe(3);
  });
});

describe('IDStamper', () => {
  describe('constructor()', () => {
    test('correctly constructs expected object', () => {
      const stamper = new WamsShared.IDStamper();
      expect(stamper).toBeInstanceOf(WamsShared.IDStamper);
      expect(stamper).toHaveProperty('stamp');
    });

  });

  describe('stamp(obj)', () => {
    const stamper = new WamsShared.IDStamper();

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
    const stamper = new WamsShared.IDStamper();

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

describe('Viewer', () => {
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
      const vs = new WamsShared.Viewer();
      expect(vs).toBeInstanceOf(WamsShared.Viewer);
      expect(vs).toHaveProperty('assign');
      expect(vs).toHaveProperty('report');
    });

    test('produces expected properties when no data provided', () => {
      const vs = new WamsShared.Viewer();
      expect(Object.keys(vs)).toEqual(props);
    });

    test('uses provided data', () => {
      const vs = new WamsShared.Viewer({x:100, y:100, rotation: 90});
      expect(Object.keys(vs)).toEqual(props);
      expect(vs.x).toBe(100);
      expect(vs.y).toBe(100);
      expect(vs.rotation).toBe(90);
      expect(vs.width).toBeNull();
      expect(vs.scale).toBeNull();
    });

    test('does not use incorrect property names in data', () => {
      const vs = new WamsShared.Viewer({x: 100, y:100, z:100});
      expect(Object.keys(vs)).toEqual(props);
      expect(vs.x).toBe(100);
      expect(vs.y).toBe(100);
      expect(vs).not.toHaveProperty('z');
    });
  });

  describe('assign(data)', () => {
    const vs = new WamsShared.Viewer();

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
    const vs = new WamsShared.Viewer({x:100, y:50, width:200, height:300});
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

describe('Message', () => {
  let emitter, reporter;

  beforeEach(() => {
    emitter = { emit: jest.fn() };
    reporter = { report: jest.fn() };
    reporter.report.mockReturnValue(42);
  });

  describe('constructor(type, reporter)', () => {
    test('Throws exception if type is invalid', () => {
      expect(() => new Message()).toThrow();
      expect(() => new Message('disconnect')).toThrow();
    });

    test('Constructs correct type of object', () => {
      let msg;
      expect(() => {
        msg = new Message(Message.CLICK, reporter);
      }).not.toThrow();
      expect(msg).toBeInstanceOf(Message);
      expect(msg.type).toBe(Message.CLICK);
      expect(msg.reporter).toEqual(reporter);
    });
  });

  describe('emitWith(emitter)', () => {
    test('Throws exception if invalid emitter provided', () => {
      const msg = new Message(Message.CLICK, reporter);
      expect(() => msg.emitWith()).toThrow();
      expect(() => msg.emitWith({})).toThrow();
    });

    test('Emits the message using the provided emitter', () => {
      const msg = new Message(Message.CLICK, reporter);
      expect(() => msg.emitWith(emitter)).not.toThrow();
      expect(reporter.report).toHaveBeenCalledTimes(1);
      expect(reporter.report).toHaveBeenLastCalledWith();
      expect(emitter.emit).toHaveBeenCalledTimes(1);
      expect(emitter.emit).toHaveBeenLastCalledWith(Message.CLICK, 42);
    });
  });
});
