'use strict';

const { Item, Rectangle } = require('shared.js');
const WorkSpace = require('server/WorkSpace.js');
const ServerItem = require('server/ServerItem.js');

let a, b, c, ia, ib, ic;
beforeAll(() => {
  ia = { x: 0, y: 0, hitbox: new Rectangle(100, 100) };
  ib = { x: 20, y: 40, hitbox: new Rectangle(100, 100) };
  ic = { x: 220, y: 240, hitbox: new Rectangle(50, 50) };
});

describe('WorkSpace', () => {
  describe('constructor(port, settings)', () => {
    test('constructs correct type of object', () => {
      expect(new WorkSpace()).toBeInstanceOf(WorkSpace);
    });

    test('Uses default settings if none provided', () => {
      expect(new WorkSpace().settings).toMatchObject(WorkSpace.DEFAULTS);
    });

    test('Uses user-defined settings, if provided', () => {
      const custom = {
        color: 'rgb(155,72, 84)',
      };
      expect(new WorkSpace(custom).settings).toMatchObject(custom);

      const ws = new WorkSpace({ color: 'a' });
      expect(ws.settings).not.toEqual(WorkSpace.DEFAULTS);
      expect(ws.settings.color).toEqual('a');
    });
  });

  describe('Methods', () => {
    let ws;
    beforeAll(() => {
      ws = new WorkSpace();
    });
    beforeEach(() => {
      ws.namespace = { emit: jest.fn() };
    });

    describe('spawnItem(values)', () => {
      test('Returns a ServerItem', () => {
        expect(ws.spawnItem()).toBeInstanceOf(ServerItem);
      });

      test('Uses default Item values', () => {
        expect(ws.spawnItem()).toMatchObject(ServerItem.DEFAULTS);
      });

      test('Uses user-defined Item values', () => {
        const i = ws.spawnItem(ia);
        expect(i).toMatchObject(ia);
      });

      test('Keeps track of the item', () => {
        const i = ws.spawnItem(ia);
        expect(ws.items).toContain(i);
      });
    });

    describe('toJSON()', () => {
      let expectedProperties;

      beforeAll(() => {
        expectedProperties = expect.arrayContaining(Object.keys(Item.DEFAULTS));
        a = ws.spawnItem(ia);
        b = ws.spawnItem(ib);
        c = ws.spawnItem(ic);
      });

      test('Returns an array', () => {
        expect(ws.toJSON()).toBeInstanceOf(Array);
      });

      test('Does not return the actual items, but simple Objects', () => {
        ws.toJSON().forEach((i) => {
          expect(i).not.toBeInstanceOf(ServerItem);
          expect(i).toBeInstanceOf(Object);
        });
      });

      test('Objects returned contain the expected data', () => {
        const r = ws.toJSON();
        r.forEach((i) => {
          expect(Object.getOwnPropertyNames(i)).toEqual(expectedProperties);
        });
      });

      test('Returns data for each item that exists in the workspace', () => {
        expect(ws.toJSON().length).toBe(ws.items.length);
      });
    });

    describe('findItemByCoordinates(x,y)', () => {
      beforeAll(() => {
        ws.items = [];
        a = ws.spawnItem(ia);
        b = ws.spawnItem(ib);
        c = ws.spawnItem(ic);
      });

      test('Finds an item at the given coordinates, if one exists', () => {
        let i = ws.findItemByCoordinates(0, 0);
        expect(i).toBeDefined();
        expect(i).toBeInstanceOf(ServerItem);
        expect(i).toBe(a);

        i = ws.findItemByCoordinates(110, 110);
        expect(i).toBeDefined();
        expect(i).toBeInstanceOf(ServerItem);
        expect(i).toBe(b);

        i = ws.findItemByCoordinates(250, 250);
        expect(i).toBeDefined();
        expect(i).toBeInstanceOf(ServerItem);
        expect(i).toBe(c);
      });

      test('Finds the first item at the given coordinates', () => {
        const i = ws.findItemByCoordinates(25, 45);
        expect(i).toBeDefined();
        expect(i).toBeInstanceOf(ServerItem);
        expect(i).toBe(b);
      });

      test('Returns falsy if no item at given coordinates', () => {
        expect(ws.findItemByCoordinates(150, 150)).toBeFalsy();
      });
    });

    describe('removeItem(item)', () => {
      test('Removes an item if it is found', () => {
        expect(ws.items).toContain(b);
        expect(() => ws.removeItem(b)).not.toThrow();
        expect(ws.items).not.toContain(b);
      });

      test('Does not remove anything if item not found', () => {
        const is = Array.from(ws.items);
        expect(() => ws.removeItem(b)).not.toThrow();
        expect(ws.items).toMatchObject(is);
      });

      test('Throws exception if no item provided', () => {
        expect(() => ws.removeItem()).toThrow();
      });
    });
  });
});
