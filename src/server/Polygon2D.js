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
   * Returns true if the given point falls inside this polygon, false otherwise.
   * 
   * Uses the winding number method for robust point-in-polygon detection.
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

    console.log("Examine: ", p);
    for (let i = 0; i < this.points.length - 1; ++i) {
      console.group("evaluating", this.points[i], this.points[i+1]);
      if (this.points[i].y <= p.y) {
        if (this.points[i + 1].y > p.y) { // Upward crossing
          console.log("upward crossing detected");
          if (p.isLeftOf(this.points[i], this.points[i + 1]) > 0) {
            console.log("left detected");
            ++wn;
          }
        }
      } else {
        if (this.points[i + 1].y <= p.y) { // Downward crossing
          console.log("downward crossing detected");
          if (p.isLeftOf(this.points[i], this.points[i + 1]) < 0) {
            console.log("right detected");
            --wn;
          }
        }
      }
      console.groupEnd();
    }

    return wn;
  }
}

module.exports = Polygon2D;

