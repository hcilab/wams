/*
 * WAMS - An API for Multi-Surface Environments
 *
 * Author: Michael van der Kamp
 *  |-> Date: July/August 2018
 *
 * Track a 2D polygon as an in-order list of Point2D objects.
 */

'use strict';

const Point2D = require('./Point2D.js');

class Polygon2D {
  /**
   * points: Array of Point2D objects, or simple objects with 'x' and 'y'
   *         properties holding numerical values.
   */
  constructor(points) {
    this.points = points.map( ({x,y}) => new Point2D(x,y) );
    this.points.push(this.points[0]);
  }

  /**
   * Determines if a point is inside the polygon. (Returns true if it is, false
   * otherwise).
   *
   * Rules for deciding whether a point is inside the polygon:
   *  1. If it is clearly outside, return false.
   *  2. If it is clearly inside, return true.
   *  3. If it is on a left or bottom edge, return true.
   *  4. If it is on a right or top edge, return false.
   *  5. If it is on a lower-left vertex, return true.
   *  6. If it is on a lower-right, upper-left, or upper-right vertex, return
   *      false.
   * 
   * Uses the winding number method for robust and efficient point-in-polygon
   * detection.  
   * See: http://geomalgorithms.com/a03-_inclusion.html
   *
   * p: Point to test.
   */
  contains(p) {
    return this.winding_number(p) !== 0;
  }

  /**
   * winding number test for a point in a polygon
   * See: http://geomalgorithms.com/a03-_inclusion.html
   *
   * Input:   p = a point,
   * Return:  wn = the winding number (=0 only when P is outside)
   */
  winding_number(p) {
    let wn = 0;

    for (let i = 0; i < this.points.length - 1; ++i) {
      if (this.points[i].y <= p.y) {
        if (this.points[i + 1].y > p.y) { // Upward crossing
          if (p.isLeftOf(this.points[i], this.points[i + 1]) > 0) {
            ++wn;
          }
        }
      } else {
        if (this.points[i + 1].y <= p.y) { // Downward crossing
          if (p.isLeftOf(this.points[i], this.points[i + 1]) < 0) {
            --wn;
          }
        }
      }
    }

    return wn;
  }
}

module.exports = Polygon2D;

