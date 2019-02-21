/* 
 * Test suite for src/server.js
 *
 * Author: Michael van der Kamp
 * Date: July/August 2018
 */

'use strict';

const { NOP } = require('../../src/shared.js');
const WorkSpace = require('../../src/server/WorkSpace.js');
const ServerItem = require('../../src/server/ServerItem.js');
const ServerView = require('../../src/server/ServerView.js');
const Polygon2D = require('../../src/server/Polygon2D.js');

function rectangle(w, h) {
  return new Polygon2D([
    { x: 0, y: 0 },
    { x: w, y: 0 },
    { x: w, y: h },
    { x: 0, y: h },
  ]);
}

let ia, ib, ic;
beforeAll(() => {
  ia = { x: 0,   y: 0,   hitbox: rectangle(100, 100) };
  ib = { x: 20,  y: 40,  hitbox: rectangle(100, 100) };
  ic = { x: 220, y: 240, hitbox: rectangle(50,  50)  };
});

describe('WorkSpace', () => {
  const DEFAULTS = Object.freeze({
    color: 'gray',
  });

  describe('constructor(port, settings)', () => {
    test('constructs correct type of object', () => {
      expect(new WorkSpace()).toBeInstanceOf(WorkSpace);
    });

    test('Stamps an immutable Id', () => {
      const ws = new WorkSpace();
      expect(ws).toHaveImmutableProperty('id');
    });

    test('Uses default settings if none provided', () => {
      expect(new WorkSpace().settings).toMatchObject(DEFAULTS);
    });

    test('Uses user-defined settings, if provided', () => {
      const custom = {
        color: 'rgb(155,72, 84)',
      };
      expect(new WorkSpace(custom).settings).toMatchObject(custom);

      const ws = new WorkSpace({color: 'a'});
      expect(ws.settings).not.toEqual(DEFAULTS);
      expect(ws.settings.bounds).toEqual(DEFAULTS.bounds);
      expect(ws.settings.color).toEqual('a');
    });
  });

  describe('spawnItem(values)', () => {
    const ws = new WorkSpace();
    const DEFAULTS = Object.freeze({
      x: 0,
      y: 0,
      hitbox: null,
      rotation: 0,
      scale: 1,
      type: 'item/foreground',
      imgsrc: '',
      blueprint: null,
    });

    test('Returns a ServerItem', () => {
      expect(ws.spawnItem()).toBeInstanceOf(ServerItem);
    });

    test('Uses default Item values if none provided', () => {
      expect(ws.spawnItem()).toMatchObject(DEFAULTS);
    });

    test('Uses user-defined Item values, if provided', () => {
      const i = ws.spawnItem(ia);
      expect(i.x).toBe(ia.x);
      expect(i.y).toBe(ia.y);
    });

    test('Keeps track of the item', () => {
      const i = ws.spawnItem(ia);
      expect(ws.items).toContain(i);
    });
  });

  describe('reportItems()', () => {
    let ws;
    const expectedProperties = [
      'x',
      'y',
      'type',
      'imgsrc',
      'blueprint',
      'hitbox',
      'rotation',
      'scale',
      'id',
    ];

    beforeAll(() => {
      ws = new WorkSpace();
      ws.spawnItem(ia);
      ws.spawnItem(ib);
      ws.spawnItem(ic);
    });

    test('Returns an array', () => {
      expect(ws.reportItems()).toBeInstanceOf(Array);
    });

    test('Does not return the actual items, but simple Objects', () => {
      ws.reportItems().forEach(i => {
        expect(i).not.toBeInstanceOf(ServerItem);
        expect(i).toBeInstanceOf(Object);
      });
    });

    test('Objects returned contain only the expected data', () => {
      const r = ws.reportItems();
      r.forEach( i => {
        expect(Object.getOwnPropertyNames(i)).toEqual(
          expect.arrayContaining(expectedProperties)
        );
      });
    });

    test('Returns data for each item that exists in the workspace', () => {
      expect(ws.reportItems().length).toBe(ws.items.length);
    });
  });

  describe('findItemByCoordinates(x,y)', () => {
    let ws;
    beforeAll(() => {
      ws = new WorkSpace();
      ws.spawnItem(ia);
      ws.spawnItem(ib);
      ws.spawnItem(ic);
    });

    test('Finds an item at the given coordinates, if one exists', () => {
      let i = ws.findItemByCoordinates(0,0);
      expect(i).toBeDefined();
      expect(i).toBeInstanceOf(ServerItem);
      expect(i).toBe(ws.items[0]);

      i = ws.findItemByCoordinates(110,110);
      expect(i).toBeDefined();
      expect(i).toBeInstanceOf(ServerItem);
      expect(i).toBe(ws.items[1]);

      i = ws.findItemByCoordinates(250,250);
      expect(i).toBeDefined();
      expect(i).toBeInstanceOf(ServerItem);
      expect(i).toBe(ws.items[2]);
    });

    test('Finds the first item at the given coordinates', () => {
      const i = ws.findItemByCoordinates(25,45);
      expect(i).toBeDefined();
      expect(i).toBeInstanceOf(ServerItem);
      expect(i).toBe(ws.items[1]);
    });

    test('Returns falsy if no item at given coordinates', () => {
      expect(ws.findItemByCoordinates(150,150)).toBeFalsy();
    });
  });

  describe('removeItem(item)', () => {
    let ws;
    let item;
    beforeAll(() => {
      ws = new WorkSpace();
      ws.spawnItem(ia);
      ws.spawnItem(ib);
      ws.spawnItem(ic);
      item = ws.findItemByCoordinates(101,101);
    });

    test('Removes an item if it is found', () => {
      expect(ws.removeItem(item)).toBe(true);
      expect(ws.items).not.toContain(item);
    });
  
    test('Does not remove anything if item not found', () => {
      const is = Array.from(ws.items);
      expect(ws.removeItem(item)).toBe(false);
      expect(ws.items).toMatchObject(is);
    });

    test('Throws exception if no item provided', () => {
      expect(() => ws.removeItem()).toThrow();
    });
  });

  describe('spawnView(values)', () => {
    let DEFAULTS;
    let ws;
    beforeAll(() => {
      ws = new WorkSpace({clientLimit:4});
      DEFAULTS = {
        x: 0,
        y: 0,
        width: 1600,
        height: 900,
        type: 'view/background',
        scale: 1,
        rotation: 0,
      };
    });

    test('Returns a ServerView', () => {
      expect(ws.spawnView()).toBeInstanceOf(ServerView);
    });

    test('Uses default View values if none provided', () => {
      expect(ws.spawnView()).toMatchObject(DEFAULTS);
    });

    test('Uses user-defined View values, if provided', () => {
      const vs = ws.spawnView({
        x: 42,
        y: 71,
        scale: 3.5,
      });
      expect(vs.x).toBe(42);
      expect(vs.y).toBe(71);
      expect(vs.scale).toBe(3.5);
      expect(vs.width).toBe(DEFAULTS.width);
      expect(vs.height).toBe(DEFAULTS.height);
    });

    test('Keeps track of View', () => {
      const vs = ws.spawnView({
        x:7,
        y:9,
        width: 42,
        height: 870,
      });
      expect(ws.views).toContain(vs);
    });
  });

  describe('reportViews()', () => {
    let ws;
    const expectedProperties = [
      'x',
      'y',
      'width',
      'height',
      'type',
      'scale',
      'rotation',
      'id',
    ];
    
    beforeAll(() => {
      ws = new WorkSpace();
      ws.spawnView();
      ws.spawnView({x:2});
      ws.spawnView({x:42,y:43});
    });

    test('Returns an array', () => {
      expect(ws.reportViews()).toBeInstanceOf(Array);
    });

    test('Does not return the actual Views, but simple Objects', () => {
      ws.reportViews().forEach( v => {
        expect(v).not.toBeInstanceOf(ServerView);
        expect(v).toBeInstanceOf(Object);
      });
    });

    test('Objects returned contain only the expected data', () => {
      ws.reportViews().forEach( v => {
        expect(Object.getOwnPropertyNames(v)).toEqual(expectedProperties);
      });
    });

    test('Returns data for each View in the workspace', () => {
      expect(ws.reportViews().length).toBe(ws.views.length);
    });
  });

  describe('removeView(view)', () => {
    let ws;
    let view;

    beforeAll(() => {
      ws = new WorkSpace();
      ws.spawnView();
      view = ws.spawnView({x:2});
      ws.spawnView({x:42,y:43});
    });

    test('Removes a view if it is found', () => {
      expect(ws.removeView(view)).toBe(true);
      expect(ws.views).not.toContain(view);
    });

    test('Does not remove anything if view not found', () => {
      const v = new ServerView({x:200,y:200});
      const curr = Array.from(ws.views);
      expect(ws.removeView(v)).toBe(false);
      expect(ws.views).toMatchObject(curr);
    });

    test('Throws exception if not view provided', () => {
      expect(() => ws.removeView()).toThrow();
    });
  });

  describe('on(event, listener)', () => {
    let ws;
    let vs;
    beforeAll(() => {
      ws = new WorkSpace();
      vs = ws.spawnView();
    });

    test('Throws if invalid event supplied', () => {
      expect(() => ws.on()).toThrow();
      expect(() => ws.on('rag')).toThrow();
    });

    describe.each([['click'],['drag'],['layout'],['scale']])('%s', (s) => {
      test('Handler starts as a NOP', () => {
        expect(ws.handlers[s]).toBe(NOP);
      });

      test('Throws if invalid listener supplied', () => {
        expect(() => ws.on(s, 'a')).toThrow();
      });

      test('Attaches a handler in the appropriate place', () => {
        const fn = jest.fn();
        ws.on(s, fn);
        expect(ws.handlers[s]).not.toBe(NOP);
        expect(ws.handlers[s]).toBeInstanceOf(Function);
      });

      test('Attached handler will call the listener when invoked', () => {
        const fn = jest.fn();
        ws.on(s, fn);
        ws.handlers[s](vs, {
          x: 3,
          y: 4,
          delta: 33,
          point: { x: 1, y: 2 }, 
          change: { x: 42, y: 43 },
          pivot: { x: 9, y: 10 },
          midpoint: { x: 50, y: 51 },
        });
        expect(fn).toHaveBeenCalledTimes(1);
        expect(fn.mock.calls[0][0]).toBe(vs);
      });
    });
  });

  describe('handle(message, ...args)', () => {
    let ws;
    let vs;
    let x, y, dx, dy, mx, my, scale, point, change, midpoint, delta, pivot;
    beforeAll(() => {
      ws = new WorkSpace();
      vs = ws.spawnView();
      x = 42;
      y = 78;
      scale = 0.883;
      delta = 1.1;
      point = { x, y };
      change = point;
      midpoint = point;
      pivot = point;
    });

    test('Throws if invalid message type provided', () => {
      expect(() => ws.handle('rag')).toThrow();
    });

    describe('click', () => {
      let fn;
      beforeAll(() => {
        fn = jest.fn();
        ws.on('click', fn);
      });

      test('Calls the appropriate listener', () => {
        expect(() => ws.handle('click', vs, {x, y})).not.toThrow();
        expect(fn).toHaveBeenCalledTimes(1);
      });

      test('Calls the listener with the expected arguments', () => {
        expect(() => ws.handle('click', vs, {x, y})).not.toThrow();
        expect(fn.mock.calls[0][0]).toBe(vs);
        expect(fn.mock.calls[0][1]).toBe(vs);
        expect(fn.mock.calls[0][2]).toBeCloseTo(x);
        expect(fn.mock.calls[0][3]).toBeCloseTo(y);
      });
    });

    describe('drag', () => {
      let fn;
      beforeAll(() => {
        fn = jest.fn();
        ws.on('drag', fn);
      });

      test('Calls the appropriate listener', () => {
        expect(() => ws.handle('drag', vs, { change, point }))
          .not.toThrow();
        expect(fn).toHaveBeenCalledTimes(1);
      });

      test('Calls the listener with the expected arguments', () => {
        expect(() => ws.handle('drag', vs, { change, point }))
          .not.toThrow();
        expect(fn.mock.calls[0][0]).toBe(vs);
        expect(fn.mock.calls[0][1]).toBe(null);
        expect(fn.mock.calls[0][2]).toBeCloseTo(change.x);
        expect(fn.mock.calls[0][3]).toBeCloseTo(change.y);
        expect(fn.mock.calls[0][4]).toBeCloseTo(pivot.x);
        expect(fn.mock.calls[0][5]).toBeCloseTo(pivot.y);
      });
    });

    describe('layout', () => {
      let fn;
      beforeAll(() => {
        fn = jest.fn();
        ws.on('layout', fn);
      });

      test('Calls the appropriate listener', () => {
        expect(() => ws.handle('layout', vs, 0)).not.toThrow();
        expect(fn).toHaveBeenCalledTimes(1);
      });

      test('Calls the listener with the expected arguments', () => {
        expect(fn).toHaveBeenLastCalledWith(vs, 0);
      });
    });

    describe('scale', () => {
      let fn;
      beforeAll(() => {
        fn = jest.fn();
        ws.on('scale', fn);
      });

      test('Calls the appropriate listener', () => {
        expect(() => ws.handle('scale', vs, { change, midpoint })).not.toThrow();
        expect(fn).toHaveBeenCalledTimes(1);
      });

      test('Calls the listener with the expected arguments', () => {
        expect(() => ws.handle('scale', vs, { change, midpoint })).not.toThrow();
        expect(fn.mock.calls[0][0]).toBe(vs);
        expect(fn.mock.calls[0][1]).toBe(null);
        expect(fn.mock.calls[0][2]).toBe(change);
        expect(fn.mock.calls[0][3]).toBeCloseTo(midpoint.x, 3);
        expect(fn.mock.calls[0][4]).toBeCloseTo(midpoint.y, 3);
      });
    });
  });
});

