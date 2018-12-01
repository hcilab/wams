/*
 * WAMS - An API for Multi-Surface Environments
 *
 * Author: Michael van der Kamp
 *  |-> Date: July/August 2018
 *
 * Define operations for a single 2D point in the model space.
 */

'use strict';

class Point2D {
  /**
   * x: x coordinate of the point
   * y: y coordinate of the point
   */
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  /**
   * Tests if a point is Left|On|Right of an infinite line. Assumes that the
   * given points are such that one is above and one is below this point.
   * FIXME: Are those semantics right?
   *
   * See: http://geomalgorithms.com/a03-_inclusion.html  
   *
   * Input:  two points p0, p1
   * Return: >0 if this point is left of the line through p0 and p1
   *         =0 if this point is on the line
   *         <0 if this point is right of the line
   */
  isLeftOf(p0, p1) {
    const dl = p1.minus(p0);
    const dp = this.minus(p0);
    return ( dl.x * dp.y ) - ( dl.y * dp.x );
  }

  /**
   * Return a new point which is the simple subraction of the given point from
   * this point.
   *
   * p: Point to subtract from this point. Has {x,y} properties.
   */
  minus({ x = 0, y = 0 }) {
    return new Point2D( this.x - x, this.y - y );
  }

  /**
   * Return a new point which is the simple addition of the given point to this
   * point.
   *
   * p: Point to add to this point. Has {x,y} properties.
   */
  plus({ x = 0, y = 0 }) {
    return new Point2D( this.x + x, this.y + y );
  }

  /**
   * Rotate the point by theta radians.
   *
   * theta: amount of rotation to apply, in radians.
   */
  rotate(theta) {
    const {x,y} = this;
    const cos_theta = Math.cos(theta);
    const sin_theta = Math.sin(theta);

    this.x = x * cos_theta - y * sin_theta;
    this.y = x * sin_theta + y * cos_theta;
    
    return this;
  }

  /**
   * Apply the given scale modifier to the point.
   *
   * ds: divide x,y by this amount
   */
  scale(ds) {
    this.x /= ds;
    this.y /= ds;
    
    return this;
  }

  /**
   * Return a new point, the multiplation of this point by the given amount.
   *
   * coefficient: Amount by which to multiply the values in this point.
   */
  times(coefficient) {
    return new Point2D(this.x * coefficient, this.y * coefficient);
  }

  /**
   * Move the point by the given amounts.
   *
   * dx: change in x axis position.
   * dy: change in y axis position.
   */
  translate(dx, dy) {
    this.x += dx;
    this.y += dy;
    
    return this;
  }
}

module.exports = Point2D;

