/*
 * WAMS - An API for Multi-Surface Environments
 *
 * Author: Michael van der Kamp
 *  |-> Date: July/August 2018
 */

'use strict';

const Point2D = require('./Point2D.js');

/**
 * A polygon in two dimensions. Can be complex.
 *
 * @memberof module:shared
 * @implements {module:shared.Hitbox}
 *
 * @param {module:shared.Point2D[]} points - The points that make up the
 * polygon, given in order (clockwise and counter-clockwise are both fine).
 */
class Polygon2D {
  constructor(points) {
    if (points.length < 1) {
      throw new TypeError('A polygon requires at least one vertex.');
    }

    /**
     * A closed list of the points making up this polygon. "Closed" here means
     * that the first and last entries of the list are the same. Closing the
     * polygon in this manner is handled by the constructor.
     *
     * @type {module:shared.Point2D[]}
     */
    this.points = points.map(({ x, y }) => new Point2D(x, y));

    /**
     * Store the centroid of the polygon for quick hit tests.
     *
     * @type {module:shared.Point2D[]}
     */
    this.centroid = Point2D.midpoint(this.points);

    /**
     * Save the maximum radius of the polygon for quick hit tests.
     *
     * @type {number}
     */
    this.radius = this.points.reduce((max, point) => {
      const curr = this.centroid.distanceTo(point);
      return max > curr ? max : curr;
    });

    // Close the polygon.
    this.points.push(this.points[0].clone());
  }

  /**
   * Determines if a point is inside the polygon.
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
   * @see {@link http://geomalgorithms.com/a03-_inclusion.html}
   *
   * @param {module:shared.Point2D[]} p - Point to test.
   *
   * @return {boolean} true if the point is inside the polygon, false otherwise.
   */
  contains(p) {
    if (this.centroid.distanceTo(p) > this.radius) {
      return false;
    }
    return this.winding_number(p) !== 0;
  }

  /**
   * Winding number test for a point in a polygon
   *
   * @see {@link http://geomalgorithms.com/a03-_inclusion.html}
   *
   * @param {module:shared.Point2D[]} point - The point to test.
   *
   * @return {number} The winding number (=0 only when P is outside)
   */
  winding_number(p) {
    let wn = 0;
    const point = new Point2D(p.x, p.y);

    for (let i = 0; i < this.points.length - 1; ++i) {
      if (this.points[i].y <= point.y) {
        if (this.points[i + 1].y > point.y) { // Upward crossing
          if (point.isLeftOf(this.points[i], this.points[i + 1]) > 0) {
            ++wn;
          }
        }
      } else {
        if (this.points[i + 1].y <= point.y) { // Downward crossing
          if (point.isLeftOf(this.points[i], this.points[i + 1]) < 0) {
            --wn;
          }
        }
      }
    }

    return wn;
  }
}

module.exports = Polygon2D;

