'use strict';

const { Item, Rectangle } = require('shared.js');
const WorkSpace = require('server/WorkSpace.js');
const ServerItem = require('server/ServerItem.js');

let itemA, itemB, itemC, propertiesA, propertiesB, propertiesC;
beforeAll(() => {
  propertiesA = { x: 0, y: 0, hitbox: new Rectangle(100, 100) };
  propertiesB = { x: 20, y: 40, hitbox: new Rectangle(100, 100) };
  propertiesC = { x: 220, y: 240, hitbox: new Rectangle(50, 50) };
});

describe('WorkSpace', () => {
  describe('Methods', () => {
    let workspace;
    beforeAll(() => {
      workspace = new WorkSpace();
    });
    beforeEach(() => {
      workspace.namespace = { emit: jest.fn() };
    });

    describe('spawnItem(values)', () => {
      test('Returns a ServerItem', () => {
        expect(workspace.spawnItem()).toBeInstanceOf(ServerItem);
      });

      test('Uses default Item values', () => {
        expect(workspace.spawnItem()).toMatchObject({
          x: 0,
          y: 0,
          rotation: 0,
          scale: 1,
          type: 'item',
          lockZ: false,
        });
      });

      test('Uses user-defined Item values', () => {
        const i = workspace.spawnItem(propertiesA);
        expect(i).toMatchObject(propertiesA);
      });

      test('Keeps track of the item', () => {
        const i = workspace.spawnItem(propertiesA);
        expect(workspace.items).toContain(i);
      });
    });

    describe('toJSON()', () => {
      beforeEach(() => {
        itemA = workspace.spawnItem(propertiesA);
        itemB = workspace.spawnItem(propertiesB);
        itemC = workspace.spawnItem(propertiesC);
      });

      test('Returns an array', () => {
        expect(workspace.toJSON()).toBeInstanceOf(Array);
      });

      test('Does not return the actual items, but simple Objects', () => {
        workspace.toJSON().forEach((i) => {
          expect(i).not.toBeInstanceOf(ServerItem);
          expect(i).toBeInstanceOf(Object);
        });
      });

      test('Objects returned contain the expected data', () => {
        const expectedProperties = expect.arrayContaining(['id', 'x', 'y', 'rotation', 'scale', 'type', 'lockZ']);
        const r = workspace.toJSON();
        r.forEach((i) => {
          expect(Object.getOwnPropertyNames(i)).toEqual(expectedProperties);
        });
      });

      test('Returns data for each item that exists in the workspace', () => {
        expect(workspace.toJSON().length).toBe(workspace.items.length);
      });
    });

    describe('findItemByCoordinates(x,y)', () => {
      beforeEach(() => {
        workspace.items = [];
        itemA = workspace.spawnItem(propertiesA);
        itemB = workspace.spawnItem(propertiesB);
        itemC = workspace.spawnItem(propertiesC);
      });

      test('Finds an item at the given coordinates, if one exists', () => {
        let i = workspace.findItemByCoordinates(0, 0);
        expect(i).toBeDefined();
        expect(i).toBeInstanceOf(ServerItem);
        expect(i).toBe(itemA);

        i = workspace.findItemByCoordinates(110, 110);
        expect(i).toBeDefined();
        expect(i).toBeInstanceOf(ServerItem);
        expect(i).toBe(itemB);

        i = workspace.findItemByCoordinates(250, 250);
        expect(i).toBeDefined();
        expect(i).toBeInstanceOf(ServerItem);
        expect(i).toBe(itemC);
      });

      test('Finds the first item at the given coordinates', () => {
        const i = workspace.findItemByCoordinates(25, 45);
        expect(i).toBeDefined();
        expect(i).toBeInstanceOf(ServerItem);
        expect(i).toBe(itemB);
      });

      test('Returns falsy if no item at given coordinates', () => {
        expect(workspace.findItemByCoordinates(150, 150)).toBeFalsy();
      });
    });

    describe('removeItem(item)', () => {
      test('Removes an item if it is found', () => {
        expect(workspace.items).toContain(itemB);
        expect(() => workspace.removeItem(itemB)).not.toThrow();
        expect(workspace.items).not.toContain(itemB);
      });

      test('Does not remove anything if item not found', () => {
        const items = Array.from(workspace.items);
        expect(() => workspace.removeItem(itemB)).not.toThrow();
        expect(workspace.items).toMatchObject(items);
      });

      test('Throws exception if no item provided', () => {
        expect(() => workspace.removeItem()).toThrow();
      });
    });
  });
});
