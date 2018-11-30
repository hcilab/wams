/* 
 * Test suite for ServerView class.
 *
 * Author: Michael van der Kamp
 * Date: July/August 2018
 */

'use strict';

const ServerView = require('../../src/server/ServerView.js');

describe('ServerView', () => {
  const DEFAULTS = {
    x: 0,
    y: 0,
    width: 1600,
    height: 900,
    type: 'view/background',
    effectiveWidth: 1600,
    effectiveHeight: 900,
    scale: 1,
    rotation: 0,
    bounds: { x: 10000, y: 10000 },
  };

  const custom = {
    x: 42,
    y: 43,
    width: 990,
    height: 867,
    scale: 1,
    bounds: { x: 5000, y: 4000 },
  };

  const mover = {
    x: 0,
    y: 0,
    width: 50,
    height: 50,
    scale: 1,
    bounds: { x: 100, y: 100 },
  };

  describe('constructor(values)', () => {
    test('Creates correct item type.', () => {
      expect( new ServerView()).toBeInstanceOf(ServerView);
    });

    test('Uses default values if none provided', () => {
      let vs;
      expect(() => vs = new ServerView()).not.toThrow();
      expect(vs).toMatchObject(DEFAULTS);
    });

    test('Uses user-defined values, if provided', () => {
      let vs;
      expect(() => vs = new ServerView(custom)).not.toThrow();
      expect(vs).toMatchObject(custom);
    });

    test('Ignores inaplicable values', () => {
      const vs = new ServerView({alpha:3});
      expect(vs.hasOwnProperty('alpha')).toBe(false);
      expect(vs.alpha).toBeUndefined();
    });

    test('Appropriately sets effective width and height', () => {
      const vs = new ServerView({
        width: 200,
        height: 100,
        scale: 2,
      });
      expect(vs.effectiveWidth).toBe(100);
      expect(vs.effectiveHeight).toBe(50);
    });

    test('Stamps an immutable Id onto the item', () => {
      const vs = new ServerView();
      expect(vs).toHaveImmutableProperty('id');
      expect(vs.id).toBeGreaterThanOrEqual(0);
    });
  });

  describe('getters', () => {
    const vs = new ServerView(mover);

    test('Can get bottom', () => {
      expect(vs.y + vs.effectiveHeight).toBe(50);
      expect(vs.bottom).toBe(50);
    });
    
    test('Can get left', () => {
      expect(vs.x).toBe(0);
      expect(vs.left).toBe(0);
      vs.x = 22;
      expect(vs.left).toBe(22);
      vs.x = 0;
      expect(vs.left).toBe(0);
    });

    test('Can get right', () => {
      expect(vs.x + vs.effectiveWidth).toBe(50);
      expect(vs.right).toBe(50);
    });

    test('Can get top', () => {
      expect(vs.y).toBe(0);
      expect(vs.top).toBe(0);
      vs.y = 42;
      expect(vs.top).toBe(42);
      vs.y = 0;
      expect(vs.top).toBe(0);
    });
  });

  describe('canBeScaledTo(width, height)', () => {
    const vs = new ServerView(mover);

    test('Accepts midrange widths and heights', () => {
      expect(vs.canBeScaledTo(75,50)).toBe(true);
      expect(vs.canBeScaledTo(25,90)).toBe(true);
    });

    test('Accepts scale that uses full space', () => {
      expect(vs.canBeScaledTo(100,100)).toBe(true);
    });

    test('Accepts widths and heights greater than 0', () => {
      expect(vs.canBeScaledTo(1,1)).toBe(true);
      expect(vs.canBeScaledTo(0.1,0.1)).toBe(true);
    });

    test('Rejects if width or height is 0', () => {
      expect(vs.canBeScaledTo(0,0)).toBe(false);
      expect(vs.canBeScaledTo(50,0)).toBe(false);
      expect(vs.canBeScaledTo(0,50)).toBe(false);
    });

    test('Rejects if width or height exceeds bounds', () => {
      expect(vs.canBeScaledTo(999,999)).toBe(false);
      expect(vs.canBeScaledTo(50,999)).toBe(false);
      expect(vs.canBeScaledTo(999,50)).toBe(false);
      expect(vs.canBeScaledTo(100,101)).toBe(false);
      expect(vs.canBeScaledTo(101,100)).toBe(false);
      expect(vs.canBeScaledTo(100,100.1)).toBe(false);
      expect(vs.canBeScaledTo(100.1,100)).toBe(false);
    });

    test('Works with x and y not equal to 0', () => {
      vs.x = 50;
      vs.y = 50;
      expect(vs.canBeScaledTo(50,50)).toBe(true);
      expect(vs.canBeScaledTo(51,50)).toBe(false);
      expect(vs.canBeScaledTo(50,51)).toBe(false);
    });
  });

  describe('scaleBy(scale)', () => {
    const vs = new ServerView(mover);

    test('Works with an acceptable scale', () => {
      expect(vs.scaleBy(2)).toBe(true);
      expect(vs.scale).toBe(2);
      expect(vs.effectiveWidth).toBe(25);
      expect(vs.effectiveHeight).toBe(25);
      expect(vs.scaleBy(0.5)).toBe(true);
      expect(vs.scale).toBe(0.5);
      expect(vs.effectiveWidth).toBe(100);
      expect(vs.effectiveHeight).toBe(100);
    });

    test('Has no effect if arguments omitted', () => {
      expect(() => vs.scaleBy()).not.toThrow();
      expect(vs.scale).toBe(0.5);
      expect(vs.effectiveWidth).toBe(100);
      expect(vs.effectiveHeight).toBe(100);
    });

    test('Does not work with an unnacceptable scale', () => {
      expect(vs.scaleBy(Number.POSITIVE_INFINITY)).toBe(false);
      expect(vs.effectiveWidth).toBe(100);
      expect(vs.effectiveHeight).toBe(100);
      expect(vs.scaleBy(0.49)).toBe(false);
      expect(vs.effectiveWidth).toBe(100);
      expect(vs.effectiveWidth).toBe(100);
      expect(vs.scaleBy(-1)).toBe(false);
      expect(vs.effectiveHeight).toBe(100);
      expect(vs.effectiveHeight).toBe(100);
      expect(vs.scaleBy(0)).toBe(false);
      expect(vs.effectiveHeight).toBe(100);
      expect(vs.effectiveHeight).toBe(100);
    });
  });

  describe('canMoveTo[X|Y](x|y)', () => {
    const vs = new ServerView(mover);

    test('Accepts inputs in centre of acceptable range', () => {
      expect(vs.canMoveToX(25)).toBe(true);
      expect(vs.canMoveToY(25)).toBe(true);
    });

    test('Rejects inputs well outside acceptable range', () => {
      expect(vs.canMoveToX(999)).toBe(false);
      expect(vs.canMoveToY(999)).toBe(false);
    });

    test('Accepts inputs on border of acceptable range', () => {
      expect(vs.canMoveToX(50)).toBe(true);
      expect(vs.canMoveToY(50)).toBe(true);
      vs.x = 50;
      vs.y = 50;
      expect(vs.canMoveToX(0)).toBe(true);
      expect(vs.canMoveToY(0)).toBe(true);
      vs.x = 0;
      vs.y = 0;
    });

    test('Rejects inputs barely outside acceptable range', () => {
      expect(vs.canMoveToX(51)).toBe(false);
      expect(vs.canMoveToY(51)).toBe(false);
      expect(vs.canMoveToX(-1)).toBe(false);
      expect(vs.canMoveToY(-1)).toBe(false);
    });

    test('Works on a scaleByd view', () => {
      vs.scaleBy(2);
      expect(vs.canMoveToX(75)).toBe(true);
      expect(vs.canMoveToY(75)).toBe(true);
      expect(vs.canMoveToX(76)).toBe(false);
      expect(vs.canMoveToY(76)).toBe(false);
      vs.scaleBy(0.67);
      expect(vs.canMoveToX(25)).toBe(true);
      expect(vs.canMoveToY(25)).toBe(true);
      expect(vs.canMoveToX(26)).toBe(false);
      expect(vs.canMoveToY(26)).toBe(false);
    });
  });

  describe('moveTo(x,y)', () => {
    const vs = new ServerView(mover);

    test('Has no effect if arguments omitted', () => {
      expect(() => vs.moveTo()).not.toThrow();
      expect(vs.x).toBe(0);
      expect(vs.y).toBe(0);
    });

    test('Works with acceptable destinations', () => {
      expect(() => vs.moveTo(1,1)).not.toThrow();
      expect(vs.x).toBe(1);
      expect(vs.y).toBe(1);
      expect(() => vs.moveTo(25.23, 47.8)).not.toThrow();
      expect(vs.x).toBe(25.23);
      expect(vs.y).toBe(47.8);
      expect(() => vs.moveTo(50,50)).not.toThrow();
      expect(vs.x).toBe(50);
      expect(vs.y).toBe(50);
      expect(() => vs.moveTo(0,0)).not.toThrow();
      expect(vs.x).toBe(0);
      expect(vs.y).toBe(0);
    });

    test('Has no effect with unacceptable destinations', () => {
      expect(() => vs.moveTo(-1,-1)).not.toThrow();
      expect(vs.x).toBe(0);
      expect(vs.y).toBe(0);
      expect(() => vs.moveTo(999,999)).not.toThrow();
      expect(vs.x).toBe(0);
      expect(vs.y).toBe(0);
      expect(() => vs.moveTo(51,51)).not.toThrow();
      expect(vs.x).toBe(0);
      expect(vs.y).toBe(0);
    });

    test('Can handle X and Y destinations independently', () => {
      expect(() => vs.moveTo(25,75)).not.toThrow();
      expect(vs.x).toBe(25);
      expect(vs.y).toBe(0);
      expect(() => vs.moveTo(-25,25)).not.toThrow();
      expect(vs.x).toBe(25);
      expect(vs.y).toBe(25);
    });
  });

  describe('moveBy(dx,dy)', () => {
    const vs = new ServerView(mover);

    test('Has no effect if arguments omitted', () => {
      expect(() => vs.moveBy()).not.toThrow();
      expect(vs.x).toBe(0);
      expect(vs.y).toBe(0);
    });

    test('Works with valid input', () => {
      expect(() => vs.moveBy(5,5)).not.toThrow();
      expect(vs.x).toBe(5);
      expect(vs.y).toBe(5);
      expect(() => vs.moveBy(45,45)).not.toThrow();
      expect(vs.x).toBe(50);
      expect(vs.y).toBe(50);
      expect(() => vs.moveBy(-1,-1)).not.toThrow();
      expect(vs.x).toBe(49);
      expect(vs.y).toBe(49);
      expect(() => vs.moveBy(-49,-49)).not.toThrow();
      expect(vs.x).toBe(0);
      expect(vs.y).toBe(0);
    });
    
    test('Does not work with invalid input', () => {
      expect(() => vs.moveBy(-1,-1)).not.toThrow();
      expect(vs.x).toBe(0);
      expect(vs.y).toBe(0);
      expect(() => vs.moveBy(51,51)).not.toThrow();
      expect(vs.x).toBe(0);
      expect(vs.y).toBe(0);
      expect(() => vs.moveBy(Number.POSITIVE_INFINITY, -1)).not.toThrow();
      expect(vs.x).toBe(0);
      expect(vs.y).toBe(0);
    });

    test('Handles X and Y movement independently', () => {
      expect(() => vs.moveBy(15,-1)).not.toThrow();
      expect(vs.x).toBe(15);
      expect(vs.y).toBe(0);
      expect(() => vs.moveBy(36,15)).not.toThrow();
      expect(vs.x).toBe(15);
      expect(vs.y).toBe(15);
    });
  });
});

