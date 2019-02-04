/*
 * WAMS - An API for Multi-Surface Environments
 *
 * Author: Michael van der Kamp
 *  |-> Date: July/August 2018
 */

'use strict';

const Point2D = require('./Point2D.js');

/**
 * Track a 2D polygon as an in-order list of Point2D objects.
 *
 * @memberof server
 */
class Polygon2D {
  /**
   * anchor: A Point2D object, the "anchor" around which the Polygon will be
   *         rotated. All the points of the Polygon should be defined relative
   *         to this point.
   * points: Array of Point2D objects, or simple objects with 'x' and 'y'
   *         properties holding numerical values. All values should be relative
   *         to the anchor point.
   */
  constructor(points) {
    this.points = points.map( ({ x, y }) => new Point2D(x, y) );
    if (this.points.length > 0) {
      this.points.push(this.points[0].clone());
    }
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
   * Rotate the polygon by the given amount.
   */
  rotate(theta) {
    this.points.forEach( p => p.rotate(theta) );
  }

  /**
   * Scale the polygon by the given amount.
   */
  scale(ds) {
    this.points.forEach( p => p.scale(ds) );
  }

  /**
   * winding number test for a point in a polygon
   * See: http://geomalgorithms.com/a03-_inclusion.html
   *
   * Input:   point = a Point2D
   * Return:  wn = the winding number (=0 only when P is outside)
   */
  winding_number(point = {}) {
    let wn = 0;
    const p = new Point2D(point.x, point.y);

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

