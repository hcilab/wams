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
  let triangle_points, rectangle_points;
  beforeAll(() => {
    triangle_points = [
      new Point2D(2,4),
      new Point2D(2,0),
      new Point2D(0,0),
    ];

    rectangle_points = [
      new Point2D(0,0),
      new Point2D(5,0),
      new Point2D(5,3),
      new Point2D(0,3),
    ];
  });

  describe('constructor(points)', () => {
    test('Constructs an object of the correct type', () => {
      expect(new Polygon2D([])).toBeInstanceOf(Polygon2D);
    });

    test('Accepts an array of Point2D objects', () => {
      let triangle;
      expect(() => triangle = new Polygon2D(triangle_points)).not.toThrow();
      expect(triangle.points).toBeDefined();
      expect(triangle.points[0]).toBeInstanceOf(Point2D);
    });
  });

  describe('contains(p)', () => {
    let rectangle, triangle, pin, pout, pon, pvertex;
    beforeAll(() => {
      triangle = new Polygon2D(triangle_points);
      rectangle = new Polygon2D(rectangle_points);
    });
    
    test('Returns true for points inside the polygon', () => {
      pin = new Point2D(1,1);
      expect(triangle.contains(pin)).toBe(true);
      pin = new Point2D(0.5,0.5);
      expect(triangle.contains(pin)).toBe(true);
      pin = new Point2D(1.5,1.5);
      expect(triangle.contains(pin)).toBe(true);
      pin = new Point2D(1.5,2,9);
      expect(triangle.contains(pin)).toBe(true);
      pin = new Point2D(1.5,0.1);
      expect(triangle.contains(pin)).toBe(true);
    });

    test('Returns false for points outside the polygon', () => {
      pout = new Point2D(1,3);
      expect(triangle.contains(pout)).toBe(false);
      pout = new Point2D(-1,1);
      expect(triangle.contains(pout)).toBe(false);
      pout = new Point2D(0,1);
      expect(triangle.contains(pout)).toBe(false);
      pout = new Point2D(1,-1);
      expect(triangle.contains(pout)).toBe(false);
    });

    test('Returns true for points on the left polygon boundary', () => {
      pon = new Point2D(1,2);
      expect(triangle.contains(pon)).toBe(true);
      pon = new Point2D(0,2);
      expect(rectangle.contains(pon)).toBe(true);
    });

    test('Returns true for points on the bottom polygon boundary', () => {
      pon = new Point2D(1,0);
      expect(triangle.contains(pon)).toBe(true);
      pon = new Point2D(1,0);
      expect(rectangle.contains(pon)).toBe(true);
    });

    test('Returns false for points on the right polygon boundary', () => {
      pout = new Point2D(2,3);
      expect(triangle.contains(pout)).toBe(false);
      pout = new Point2D(5,2);
      expect(rectangle.contains(pout)).toBe(false);
    });

    test('Returns false for points on the top polygon boundary', () => {
      pout = new Point2D(2,3);
      expect(rectangle.contains(pout)).toBe(false);
    });

    test('Returns true for lower-left vertices', () => {
      pon = new Point2D(0,0);
      expect(triangle.contains(pon)).toBe(true);
      expect(rectangle.contains(pon)).toBe(true);
    });

    test('Returns false for upper-left vertices', () => {
      pout = new Point2D(0,3);
      expect(rectangle.contains(pout)).toBe(false);
    });

    test('Returns false for upper-right vertices', () => {
      pout = new Point2D(2,4);
      expect(triangle.contains(pout)).toBe(false);
      pout = new Point2D(5,3);
      expect(rectangle.contains(pout)).toBe(false);
    });

    test('Returns false for lower-right vertices', () => {
      pout = new Point2D(2,0);
      expect(triangle.contains(pout)).toBe(false);
      pout = new Point2D(5,0);
      expect(rectangle.contains(pout)).toBe(false);
    });

    describe('Confirm against example from paper', () => {
      /*
       * Complex polygon will have the following structure:
       *
       *  9=========8
       *  [*********]
       *  [*********]
       *  [****3==============2
       *  [****['''''*********]       
       *  [****['''''*********]       
       *  [****4=========5****]
       *  [*********] !  [****]
       *  [*********] !  [****]
       *  [*********7====6****]
       *  [*******************]
       *  [*******************]
       *  0===================1
       *
       * The region marked '!' should be considered to be 'outside' the polygon,
       * while the region filled in with "'" should be considered 'inside' the
       * polygon.
       */
      let complex, p;
      beforeAll(() => {
        complex = new Polygon2D([
          new Point2D(0,0), // 0
          new Point2D(8,0), // 1
          new Point2D(8,6), // 2
          new Point2D(2,6), // 3
          new Point2D(2,4), // 4
          new Point2D(6,4), // 5
          new Point2D(6,2), // 6
          new Point2D(4,2), // 7
          new Point2D(4,8), // 8
          new Point2D(0,8), // 9
        ]);
      });

      test('Returns correct response for simple in regions', () => {
        p = new Point2D(1,1);
        expect(complex.contains(p)).toBe(true);
        p = new Point2D(3,7);
        expect(complex.contains(p)).toBe(true);
        p = new Point2D(1,7);
        expect(complex.contains(p)).toBe(true);
        p = new Point2D(7,1);
        expect(complex.contains(p)).toBe(true);
        p = new Point2D(7,5);
        expect(complex.contains(p)).toBe(true);
        p = new Point2D(5,5);
        expect(complex.contains(p)).toBe(true);
      });

      test('Returns correct response for simple out regions', () => {
        p = new Point2D(-1,1);
        expect(complex.contains(p)).toBe(false);
        p = new Point2D(1,-1);
        expect(complex.contains(p)).toBe(false);
        p = new Point2D(1,9);
        expect(complex.contains(p)).toBe(false);
        p = new Point2D(9,1);
        expect(complex.contains(p)).toBe(false);
        p = new Point2D(5,7);
        expect(complex.contains(p)).toBe(false);
      });

      test('Returns correct result for "hole" region', () => {
        p = new Point2D(5,3);
        expect(complex.contains(p)).toBe(false);
      });

      test('Returns correct result for overlapping region', () => {
        p = new Point2D(3,5);
        expect(complex.contains(p)).toBe(true);
      });

    });

  });

});

