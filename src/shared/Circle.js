'use strict';

/**
 * A simple circular hitbox. Remember that this circle describes the item as if
 * its settings were x=0, y=0, scale=1, rotation=0.
 *
 * @memberof module:shared
 * @implements {module:shared.Hitbox}
 *
 * @param {number} radius - The radius of the circle.
 * @param {number} [x=0] - The x offset of the circle.
 * @param {number} [y=0] - The y offset of the circle.
 */
class Circle {
  constructor(radius, x = 0, y = 0) {
    /**
     * The radius of the circle.
     *
     * @type {number}
     */
    this.radius = radius;

    /**
     * The x coordinate of the circle.
     *
     * @type {number}
     */
    this.x = x;

    /**
     * The y coordinate of the circle.
     *
     * @type {number}
     */
    this.y = y;
  }

  /**
   * Determines if a point is inside the circle.
   *
   * @param {module:shared.Point2D} point - The point to test.
   *
   * @return {boolean} true if the point is inside the circle, false
   * otherwise.
   */
  contains(point) {
    const distance = Math.sqrt(Math.pow(point.x - this.x, 2) + Math.pow(point.y - this.y, 2));
    return distance <= this.radius;
  }
}

module.exports = Circle;
