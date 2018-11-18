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

describe('WorkSpace', () => {
  const DEFAULTS = Object.freeze({
    bounds: {
      x: 10000,
      y: 10000,
    },
    color: '#aaaaaa',
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
        bounds: {
          x: 1080,
          y: 1920,
        },
      };
      expect(new WorkSpace(custom).settings).toMatchObject(custom);

      const ws = new WorkSpace({color: 'a'});
      expect(ws.settings).not.toEqual(DEFAULTS);
      expect(ws.settings.bounds).toEqual(DEFAULTS.bounds);
      expect(ws.settings.color).toEqual('a');
    });
  });

  describe('getters and setters', () => {
    const bounded = {bounds: {x: 700, y: 800} };
    const ws = new WorkSpace(bounded);

    test('can get width', () => {
      expect(ws.width).toBe(bounded.bounds.x);
    });

    test('can get height', () => {
      expect(ws.height).toBe(bounded.bounds.y);
    });

    test('can set width', () => {
      ws.width = 42;
      expect(ws.width).toBe(42);
    });

    test('can set height', () => {
      ws.height = 43;
      expect(ws.height).toBe(43);
    });
  });

  describe('spawnItem(values)', () => {
    const ws = new WorkSpace();
    const DEFAULTS = Object.freeze({
      x: 0,
      y: 0,
      width: 128,
      height: 128,
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
      const i = ws.spawnItem({x:70,y:40});
      expect(i.x).toBe(70);
      expect(i.y).toBe(40);
      expect(i.width).toBe(DEFAULTS.width);
      expect(i.height).toBe(DEFAULTS.height);
    });

    test('Keeps track of the item', () => {
      const i = ws.spawnItem({x:155,y:155});
      expect(ws.items).toContain(i);
    });
  });

  describe('reportItems()', () => {
    let ws;
    const expectedProperties = [
      'x',
      'y',
      'width',
      'height',
      'type',
      'imgsrc',
      'blueprint',
      'id',
    ];

    beforeAll(() => {
      ws = new WorkSpace();
      ws.spawnItem();
      ws.spawnItem({x:20,y:40});
      ws.spawnItem({x:220,y:240,width:50,height:50});
    });

    test('Returns an array', () => {
      expect(ws.reportItems()).toBeInstanceOf(Array);
    });

    test('Does not return the actual items, but simple Objects', () => {
      const r = ws.reportItems();
      r.forEach( i => {
        expect(i).not.toBeInstanceOf(ServerItem);
        expect(i).toBeInstanceOf(Object);
      });
    });

    test('Objects returned contain only the expected data', () => {
      const r = ws.reportItems();
      r.forEach( i => {
        expect(Object.getOwnPropertyNames(i)).toEqual(expectedProperties);
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
      ws.spawnItem({x:0,y:0,width:100,height:100});
      ws.spawnItem({x:20,y:40,width:100,height:100});
      ws.spawnItem({x:220,y:240,width:50,height:50});
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
      ws.spawnItem({x:0,y:0,width:100,height:100});
      ws.spawnItem({x:20,y:40,width:100,height:100});
      ws.spawnItem({x:220,y:240,width:50,height:50});
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
        effectiveWidth: 1600,
        effectiveHeight: 900,
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
      'effectiveWidth',
      'effectiveHeight',
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
        ws.handlers[s](vs, {x:1, y:2, phase: 'move'});
        expect(fn).toHaveBeenCalledTimes(1);
        expect(fn.mock.calls[0][0]).toBe(vs);
      });
    });
  });

  describe('handle(message, ...args)', () => {
    let ws;
    let vs;
    let x, y, dx, dy, scale, phase;
    beforeAll(() => {
      ws = new WorkSpace();
      vs = ws.spawnView();
      x = 42;
      y = 78;
      dx = 5.2;
      dy = -8.79;
      scale = 0.883;
      phase = 'move';
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
        expect(() => ws.handle('drag', vs, {x, y, dx, dy, phase}))
          .not.toThrow();
        expect(fn).toHaveBeenCalledTimes(1);
      });

      test('Calls the listener with the expected arguments', () => {
        expect(() => ws.handle('drag', vs, {x, y, dx, dy, phase}))
          .not.toThrow();
        expect(fn.mock.calls[0][0]).toBe(vs);
        expect(fn.mock.calls[0][1]).toBe(vs);
        expect(fn.mock.calls[0][2]).toBeCloseTo(x);
        expect(fn.mock.calls[0][3]).toBeCloseTo(y);
        expect(fn.mock.calls[0][4]).toBeCloseTo(dx);
        expect(fn.mock.calls[0][5]).toBeCloseTo(dy);
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
        expect(() => ws.handle('scale', vs, {scale})).not.toThrow();
        expect(fn).toHaveBeenCalledTimes(1);
      });

      test('Calls the listener with the expected arguments', () => {
        expect(() => ws.handle('scale', vs, {scale})).not.toThrow();
        expect(fn).toHaveBeenLastCalledWith(vs, scale);
      });
    });
  });
});

