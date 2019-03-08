/*
 * WAMS - An API for Multi-Surface Environments
 *
 * Author: Michael van der Kamp
 */

'use strict';

/**
 * Defines a set of basic operations on a point in a two dimensional space.
 *
 * @memberof module:shared
 */
class Point2D {
  /**
   * @param {number} x - x coordinate of the point.
   * @param {number} y - y coordinate of the point.
   */
  constructor(x = 0, y = 0) {
    /**
     * X coordinate of the point.
     *
     * @type {number}
     */
    this.x = x;

    /**
     * X coordinate of the point.
     *
     * @type {number}
     */
    this.y = y;
  }

  /**
   * Add the given point to this point.
   *
   * @param {module:gestures.Point2D} point - The point to add.
   */
  add({ x = 0, y = 0 }) {
    this.x += x;
    this.y += y;
  }

  /**
   * Calculates the angle between this point and the given point.
   *
   * @param {!module:gestures.Point2D} point - Projected point for calculating
   * the angle.
   *
   * @return {number} Radians along the unit circle where the projected
   * point lies.
   */
  angleTo(point) {
    return Math.atan2(point.y - this.y, point.x - this.x);
  }

  /**
   * Determine the average distance from this point to the provided array of
   * points.
   *
   * @param {!module:gestures.Point2D[]} points - the Point2D objects to
   *    calculate the average distance to.
   *
   * @return {number} The average distance from this point to the provided
   *    points.
   */
  averageDistanceTo(points) {
    return this.totalDistanceTo(points) / points.length;
  }

  /**
   * Clones this point.
   *
   * @returns {module:shared.Point2D} An exact clone of this point.
   */
  clone() {
    return new Point2D(this.x, this.y);
  }

  /**
   * Calculates the distance between two points.
   *
   * @param {!module:gestures.Point2D} point - Point to which the distance is
   * calculated.
   *
   * @return {number} The distance between the two points, a.k.a. the
   *    hypoteneuse.
   */
  distanceTo(point) {
    return Math.hypot(point.x - this.x, point.y - this.y);
  }

  /**
   * Divide the point's values by the given amount.
   *
   * @param {number} ds - divide x,y by this amount.
   *
   * @return {module:shared.Point2D} this
   */
  divideBy(ds = 1) {
    this.x /= ds;
    this.y /= ds;
    return this;
  }

  /**
   * Tests if a point is Left|On|Right of an infinite line. Assumes that the
   * given points are such that one is above and one is below this point. Note
   * that the semantics of left/right is based on the normal coordinate space,
   * not the y-axis-inverted coordinate space of images and the canvas.
   *
   * @see {@link http://geomalgorithms.com/a03-_inclusion.html}
   *
   * @param {module:shared.Point2D} p0 - first point of the line.
   * @param {module:shared.Point2D} p1 - second point of the line.
   *
   * @return {number} >0 if this point is left of the line through p0 and p1
   * @return {number} =0 if this point is on the line
   * @return {number} <0 if this point is right of the line
   */
  isLeftOf(p0, p1) {
    const dl = p1.minus(p0);
    const dp = this.minus(p0);
    return (dl.x * dp.y) - (dl.y * dp.x);
  }

  /**
   * Subtracts the given point from this point to form a new point.
   *
   * @param {module:shared.Point2D} p - Point to subtract from this point.
   *
   * @return {module:shared.Point2D} A new point which is the simple subraction
   * of the given point from this point.
   */
  minus({ x = 0, y = 0 }) {
    return new Point2D(this.x - x, this.y - y);
  }

  /**
   * Add the given point to this point.
   *
   * @param {module:shared.Point2D} p - Point to add to this point.
   *
   * @return {module:shared.Point2D} A new point which is the simple addition of
   * the given point from this point.
   */
  plus({ x = 0, y = 0 }) {
    return new Point2D(this.x + x, this.y + y);
  }

  /**
   * Rotate the point by theta radians.
   *
   * @param {number} theta - Amount of rotation to apply, in radians.
   *
   * @return {module:shared.Point2D} this
   */
  rotate(theta = 0) {
    const { x, y } = this;
    const cos_theta = Math.cos(theta);
    const sin_theta = Math.sin(theta);

    this.x = x * cos_theta - y * sin_theta;
    this.y = x * sin_theta + y * cos_theta;

    return this;
  }

  /**
   * Apply the given scale modifier to the point.
   *
   * @param {number} ds - Divide x,y by this amount.
   *
   * @return {module:shared.Point2D} this
   */
  scale(ds = 1) {
    this.x *= ds;
    this.y *= ds;
    return this;
  }

  /**
   * Multiply this point by the given point to form a new point.
   *
   * @param {number} coefficient - Amount by which to multiply the values in
   * this point.
   *
   * @return {module:shared.Point2D} Return a new point, the multiplation of
   * this point by the given amount.
   */
  times(coefficient = 1) {
    return new Point2D(this.x * coefficient, this.y * coefficient);
  }

  /**
   * Calculates the total distance from this point to an array of points.
   *
   * @param {!module:gestures.Point2D[]} points - The array of Point2D objects
   *    to calculate the total distance to.
   *
   * @return {number} The total distance from this point to the provided points.
   */
  totalDistanceTo(points) {
    return points.reduce((d, p) => d + this.distanceTo(p), 0);
  }

  /**
   * Move the point by the given amounts.
   *
   * @param {number} dx - change in x axis position.
   * @param {number} dy - change in y axis position.
   *
   * @return {module:shared.Point2D} this
   */
  translate(dx = 0, dy = 0) {
    this.x += dx;
    this.y += dy;

    return this;
  }

  /**
   * Calculates the midpoint of a list of points.
   *
   * @param {module:gestures.Point2D[]} points - The array of Point2D objects
   *    for which to calculate the midpoint
   *
   * @return {module:gestures.Point2D} The midpoint of the provided points.
   */
  static midpoint(points = []) {
    if (points.length === 0) return null;

    const total = Point2D.sum(points);
    return new Point2D(
      total.x / points.length,
      total.y / points.length,
    );
  }

  /**
   * Calculates the sum of the given points.
   *
   * @param {module:gestures.Point2D[]} points - The Point2D objects to sum up.
   *
   * @return {module:gestures.Point2D} A new Point2D representing the sum of the
   * given points.
   */
  static sum(points = []) {
    return points.reduce((total, pt) => total.plus(pt), new Point2D(0, 0));
  }
}

module.exports = Point2D;

