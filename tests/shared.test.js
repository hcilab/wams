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

describe('getInitialValues', () => {
  test('does not throw exceptions on empty objects', () => {
    expect(WamsShared.getInitialValues()).toEqual({});
  });

  test('returns empty if defaults is empty, regardless of data', () => {
    expect(WamsShared.getInitialValues({},{})).toEqual({});
    expect(WamsShared.getInitialValues({})).toEqual({});
    expect(WamsShared.getInitialValues({},{a:1})).toEqual({});
    expect(WamsShared.getInitialValues({},1)).toEqual({});
  });

  test('Uses defaults if data is empty.', () => {
    expect(WamsShared.getInitialValues({a:1})).toEqual({a:1});
    expect(WamsShared.getInitialValues({a:1},{})).toEqual({a:1});
  });

  test('Overrides default property if data has property with same name', () => {
    expect(WamsShared.getInitialValues({a:1}, {a:2})).toEqual({a:2});
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

describe('removeById(array, item, class_fn)', () => {
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
    expect(() => WamsShared.removeById()).toThrow();
    expect(() => WamsShared.removeById({})).toThrow();
  });

  test('Removes the item with the corresponding Id, if present', () => {
    const a1 = new A(1);
    const a2 = new A(2);
    const a3 = new A(3);
    expect(arr.length).toBe(3);
    expect(() => WamsShared.removeById(arr,a1)).not.toThrow();
    expect(arr.find(a => a.id === 1)).toBeUndefined();
    expect(() => WamsShared.removeById(arr,a2)).not.toThrow();
    expect(arr.find(a => a.id === 2)).toBeUndefined();
    expect(() => WamsShared.removeById(arr,a3)).not.toThrow();
    expect(arr.find(a => a.id === 3)).toBeUndefined();
    expect(arr.length).toBe(0);
  });

  test('Does not remove any item if no item with Id present.', () => {
    const a4 = new A(4);
    expect(arr.length).toBe(3);
    expect(() => WamsShared.removeById(arr,a4)).not.toThrow();
    expect(arr.length).toBe(3);
  });
});

describe('IdStamper', () => {
  describe('constructor()', () => {
    test('correctly constructs expected object', () => {
      expect(new IdStamper()).toBeInstanceOf(IdStamper);
    });
  });

  describe('stampNewId(obj)', () => {
    const stamper = new WamsShared.IdStamper();

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
    const stamper = new WamsShared.IdStamper();

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

