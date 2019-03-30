/*
 * Test suite for Point2D class.
 *
 * Author: Michael van der Kamp
 * Date: November 2018
 */

'use strict';

const Point2D = require('../../src/server/Point2D.js');

describe('Point2D', () => {
  describe('constructor(x, y)', () => {
    test('Constructs an object of the correct type', () => {
      expect(new Point2D(1, 2)).toBeInstanceOf(Point2D);
    });

    test('Defaults x and y to 0 if not provided', () => {
      let p;
      expect(() => p = new Point2D()).not.toThrow();
      expect(p.x).toBe(0);
      expect(p.y).toBe(0);
    });

    test('Uses given x and y values', () => {
      let p;
      expect(() => p = new Point2D(42, 9)).not.toThrow();
      expect(p.x).toBe(42);
      expect(p.y).toBe(9);
    });
  });

  describe('minus(p)', () => {
    let p, q;
    beforeEach(() => {
      p = new Point2D(42, 53);
      q = new Point2D(13, 8);
    });

    test('Subtracts the given point from "this" point', () => {
      let r;
      expect(() => r = p.minus(q)).not.toThrow();
      expect(r.x).toBe(29);
      expect(r.y).toBe(45);

      expect(() => r = q.minus(p)).not.toThrow();
      expect(r.x).toBe(-29);
      expect(r.y).toBe(-45);
    });

    test('Does not change "this" point or the given point', () => {
      p.minus(q);
      expect(p).toMatchObject({ x: 42, y: 53 });
      expect(q).toMatchObject({ x: 13, y: 8 });
    });

    test('Defaults to x = 0 and y = 0 if not defined', () => {
      let r;
      expect(() => r = p.minus({})).not.toThrow();
      expect(r).toMatchObject(p);
    });
  });

  describe('isLeftOf(p0, p1)', () => {
    let p, p0, paboveleft, paboveright, pequal, pleft, pright;
    beforeAll(() => {
      p = new Point2D(0, 0);
      p0 = new Point2D(0, 1);
      pleft = new Point2D(-1, -1);
      pright = new Point2D(1, -1);
      pequal = new Point2D(0, -1);
      paboveleft = new Point2D(1, 2);
      paboveright = new Point2D(-1, 2);
    });

    test('Returns >0 if point is left of the line through p0 and p1', () => {
      expect(p.isLeftOf(p0, pleft)).toBeGreaterThan(0);
    });

    test('Returns =0 if point is on the line through p0 and p1', () => {
      expect(p.isLeftOf(p0, pequal)).toBe(0);
    });

    test('Returns <0 if point is right of the line through p0 and p1', () => {
      expect(p.isLeftOf(p0, pright)).toBeLessThan(0);
    });
  });
});


