'use strict';

/**
 * A rectangular hitbox. Remember that this rectangle describes the item as if
 * its settings were x=0, y=0, scale=1, rotation=0.
 *
 * @memberof module:shared
 * @implements {module:shared.Hitbox}
 *
 * @param {number} width - The width of the rectangle.
 * @param {number} height - The height of the rectangle.
 * @param {number} [x=0] - The x offset of the rectangle.
 * @param {number} [y=0] - The y offset of the rectangle.
 */
class Rectangle {
  constructor(width, height, x = 0, y = 0) {
    /**
     * The width of the rectangle.
     *
     * @type {number}
     */
    this.width = width;

    /**
     * The height of the rectangle.
     *
     * @type {number}
     */
    this.height = height;

    /**
     * The x coordinate of the rectangle.
     *
     * @type {number}
     */
    this.x = x;

    /**
     * The y coordinate of the rectangle.
     *
     * @type {number}
     */
    this.y = y;
  }

  /**
   * Determines if a point is inside the rectangle.
   *
   * @param {module:shared.Point2D} point - The point to test.
   *
   * @return {boolean} true if the point is inside the rectangle, false
   * otherwise.
   */
  contains(point) {
    return point.x >= this.x && point.x <= this.x + this.width && point.y >= this.y && point.y <= this.y + this.height;
  }
}

module.exports = Rectangle;
