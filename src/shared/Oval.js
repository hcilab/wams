'use strict';

/**
 * An oval hitbox. Remember that this oval describes the item as if its settings
 * were x=0, y=0, scale=1, rotation=0.
 *
 * @memberof module:shared
 * @implements {module:shared.Hitbox}
 *
 * @param {number} radiusX - The radius of the oval in the x direction.
 * @param {number} radiusY - The radius of the oval in the y direction.
 * @param {number} [x=0] - The x offset of the oval.
 * @param {number} [y=0] - The y offset of the oval.
 */
class Oval {
  constructor(radiusX, radiusY, x = 0, y = 0) {
    /**
     * The radius of the circle in the x direction.
     *
     * @type {number}
     */
    this.radiusX = radiusX;

    /**
     * The radius of the circle in the y direction.
     *
     * @type {number}
     */
    this.radiusY = radiusY;

    /**
     * The x coordinate of the centre of the oval.
     *
     * @type {number}
     */
    this.x = x;

    /**
     * The y coordinate of the centre of the oval.
     *
     * @type {number}
     */
    this.y = y;
  }

  /**
   * Determines if a point is inside the oval.
   *
   * @param {module:shared.Point2D} point - The point to test.
   *
   * @return {boolean} true if the point is inside the oval, false otherwise.
   */
  contains(point) {
    const distance = Math.sqrt(
      Math.pow(point.x - this.x, 2) / Math.pow(this.radiusX, 2) +
        Math.pow(point.y - this.y, 2) / Math.pow(this.radiusY, 2)
    );
    return distance <= 1;
  }
}

module.exports = Oval;
