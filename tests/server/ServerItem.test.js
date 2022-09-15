/*
 * Test suite for ServerItem class
 *
 * Author: Michael van der Kamp
 * Date: July/August 2018
 */

'use strict';

const { Item, Rectangle } = require('shared.js');
const ServerItem = require('server/ServerItem.js');

let item, namespace;
beforeEach(() => {
  namespace = { emit: jest.fn() };
});

describe('ServerItem', () => {
  describe('constructor(namespace, values)', () => {
    test('Throws exception if no namespace provided', () => {
      expect(() => (item = new ServerItem())).toThrow();
    });

    test('Uses defaults if no values provided', () => {
      expect(() => (item = new ServerItem(namespace))).not.toThrow();
      expect(item).toMatchObject(Item.DEFAULTS);
    });

    test('Creates correct type of item', () => {
      expect(new ServerItem(namespace)).toBeInstanceOf(ServerItem);
    });

    test('Uses user-defined values, if provided', () => {
      const props = { y: 75, type: 'joker' };
      const result = { ...Item.DEFAULTS, ...props };
      expect(() => (item = new ServerItem(namespace, props))).not.toThrow();
      expect(item).toMatchObject(props);
      expect(item).toMatchObject(result);
    });

    test('Stamps the item with an immutable Id', () => {
      const item = new ServerItem(namespace);
      expect(item).toHaveImmutableProperty('id');
      expect(item.id).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Methods', () => {
    const props = {
      x: 50,
      y: 50,
      hitbox: new Rectangle(100, 100),
    };
    beforeAll(() => {
      item = new ServerItem(namespace, props);
    });

    describe('containsPoint(x,y)', () => {
      test('Accepts points completely inside square', () => {
        expect(item.containsPoint(75, 75)).toBe(true);
        expect(item.containsPoint(51, 51)).toBe(true);
        expect(item.containsPoint(149, 149)).toBe(true);
      });

      test('Rejects points completely outside the square', () => {
        expect(item.containsPoint(0, 0)).toBe(false);
        expect(item.containsPoint(200, 0)).toBe(false);
        expect(item.containsPoint(0, 200)).toBe(false);
        expect(item.containsPoint(200, 200)).toBe(false);
      });

      test('Rejects points just outside the border of the square', () => {
        expect(item.containsPoint(49, 49)).toBe(false);
        expect(item.containsPoint(49, 151)).toBe(false);
        expect(item.containsPoint(151, 49)).toBe(false);
        expect(item.containsPoint(151, 151)).toBe(false);
      });

      test('Rejects when only one coordinate is valid', () => {
        expect(item.containsPoint(25, 75)).toBe(false);
        expect(item.containsPoint(75, 25)).toBe(false);
      });

      test('Rejects when one coordinate is barely outside the square', () => {
        expect(item.containsPoint(49, 50)).toBe(false);
        expect(item.containsPoint(50, 49)).toBe(false);
        expect(item.containsPoint(150, 151)).toBe(false);
        expect(item.containsPoint(151, 150)).toBe(false);
      });
    });

    describe('moveTo(x, y)', () => {
      test('Has no effect if parameters left out', () => {
        expect(item.x).toBe(50);
        expect(item.y).toBe(50);
        expect(() => item.moveTo()).not.toThrow();
        expect(item.x).toBe(50);
        expect(item.y).toBe(50);
      });

      test('Moves the item to the given coordinates.', () => {
        expect(() => item.moveTo(1000, 9999)).not.toThrow();
        expect(item.x).toBe(1000);
        expect(item.y).toBe(9999);
      });

      test('Works with negative values', () => {
        expect(() => item.moveTo(-50, -1000)).not.toThrow();
        expect(item.x).toBe(-50);
        expect(item.y).toBe(-1000);
      });

      test('Does not affect other values', () => {
        expect(() => item.moveTo(Item.DEFAULTS.x, Item.DEFAULTS.y)).not.toThrow();
        expect(item).toMatchObject(Item.DEFAULTS);
      });
    });

    describe('moveBy(dx, dy)', () => {
      test('Has no effect if parameters left out', () => {
        expect(item.x).toBe(0);
        expect(item.y).toBe(0);
        expect(() => item.moveBy()).not.toThrow();
        expect(item.x).toBe(0);
        expect(item.y).toBe(0);
      });

      test('Moves the item by the given amount', () => {
        expect(() => item.moveBy(10, 20)).not.toThrow();
        expect(item.x).toBe(10);
        expect(item.y).toBe(20);
        expect(() => item.moveBy(13, 27)).not.toThrow();
        expect(item.x).toBe(23);
        expect(item.y).toBe(47);
      });

      test('Works with negative values', () => {
        expect(() => item.moveBy(-5, -8)).not.toThrow();
        expect(item.x).toBe(18);
        expect(item.y).toBe(39);
        expect(() => item.moveBy(-25, -48)).not.toThrow();
        expect(item.x).toBe(-7);
        expect(item.y).toBe(-9);
      });

      test('Has no effect on other values', () => {
        expect(() => item.moveBy(7, 9)).not.toThrow();
        Object.entries(ServerItem.DEFAULTS).forEach(([p, v]) => {
          expect(item[p]).toEqual(v);
        });
      });
    });
  });
});
