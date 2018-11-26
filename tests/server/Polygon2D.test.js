/* 
 * Test suite for Polygon2D class.
 *
 * Author: Michael van der Kamp
 * Date: November 2018
 */

'use strict';

const Polygon2D = require('../../src/server/Polygon2D.js');
const Point2D = require('../../src/server/Point2D.js');

// to test:
// Polygon2D#contains(p)

describe('Polygon2D', () => {
  let ps;
  beforeAll(() => {
    ps = [
      new Point2D(2,4),
      new Point2D(2,0),
      new Point2D(0,0),
    ];
  });

  describe('constructor(points)', () => {
    test('Constructs an object of the correct type', () => {
      expect(new Polygon2D([])).toBeInstanceOf(Polygon2D);
    });

    test('Accepts an array of Point2D objects', () => {
      let poly;
      expect(() => poly = new Polygon2D(ps)).not.toThrow();
      expect(poly.points).toBeDefined();
      expect(poly.points[0]).toBeInstanceOf(Point2D);
    });
  });

  describe('contains(p)', () => {
    let poly, pin, pout, pon, pvertex;
    beforeAll(() => {
      poly = new Polygon2D(ps);
    });
    
    test.skip('Returns true for points inside the polygon', () => {
      pin = new Point2D(1,1);
      expect(poly.contains(pin)).toBe(true);
      pin = new Point2D(0.5,0.5);
      expect(poly.contains(pin)).toBe(true);
      pin = new Point2D(1.5,1.5);
      expect(poly.contains(pin)).toBe(true);
      pin = new Point2D(1.5,2,9);
      expect(poly.contains(pin)).toBe(true);
      pin = new Point2D(1.5,0.1);
      expect(poly.contains(pin)).toBe(true);
    });

    test.skip('Returns false for points outside the polygon', () => {
      pout = new Point2D(1,3);
      expect(poly.contains(pout)).toBe(false);
      pout = new Point2D(-1,1);
      expect(poly.contains(pout)).toBe(false);
      pout = new Point2D(0,1);
      expect(poly.contains(pout)).toBe(false);
      pout = new Point2D(1,-1);
      expect(poly.contains(pout)).toBe(false);
    });

    test('Returns true for points on the polygon boundary', () => {
      // pon = new Point2D(1,2);
      // expect(poly.contains(pon)).toBe(true);
      pon = new Point2D(2,1);
      expect(poly.contains(pon)).toBe(true);
    });

    test.skip('Returns true for points on a vertex of the polygon', () => {
      pvertex = new Point2D(0,0);
      expect(poly.contains(pvertex)).toBe(true);
      pvertex = new Point2D(2,0);
      expect(poly.contains(pvertex)).toBe(true);
      pvertex = new Point2D(2,4);
      expect(poly.contains(pvertex)).toBe(true);
    });

  });

});

