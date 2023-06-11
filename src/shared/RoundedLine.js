'use strict';

/**
 * A simple line hitbox. Remember that this line describes the item as if
 * its settings were x=0, y=0, scale=1, rotation=0.
 *
 * The hitbox supports a line whose enpoint is rounded with a radius of width/2.
 *
 * @memberof module:shared
 * @implements {module:shared.Hitbox}
 *
 * @param {number} [x1=0] - The x1 offset of the line.
 * @param {number} [y1=0] - The y1 offset of the line.
 * @param {number} [x2=1] - The x2 offset of the line.
 * @param {number} [y2=1] - The y2 offset of the line.
 * @param {number} [width=1] - The width of the line.
 */
class RoundedLine {
  constructor(x1 = 0, y1 = 0, x2 = 1, y2 = 1, width = 1) {
    /**
     * The x1 coordinate of the line.
     *
     * @type {number}
     * @default 0
     */
    this.x1 = x1;

    /**
     * The y1 coordinate of the line.
     *
     * @type {number}
     * @default 0
     */
    this.y1 = y1;

    /**
     * The x2 coordinate of the line.
     *
     * @type {number}
     * @default 1
     */
    this.x2 = x2;

    /**
     * The y1 coordinate of the line.
     *
     * @type {number}
     * @default 1
     */
    this.y2 = y2;

    /**
     * The width of the line.
     *
     * @type {number}
     * @default 1
     */
    this.width = width;
  }

  /**
   * Determines if a point is inside the line.
   *
   * @param {module:shared.Point2D} point - The point to test.
   *
   * @return {boolean} true if the point is inside the line, false otherwise.
   */
  contains(point) {
    // Distance to first endpoint
    const A = point.x - this.x1;
    const B = point.y - this.y1;

    // Length of line
    const C = this.x2 - this.x1;
    const D = this.y2 - this.y1;

    const dot = A * C + B * D;
    const lengthSquared = C * C + D * D;

    // Find the nearest point along the line
    let param = -1;
    if (lengthSquared !== 0) // in case of 0-length line
      param = dot / lengthSquared;
    let xx, yy;
    if (param < 0) {
      xx = this.x1;
      yy = this.y1;
    } else if (param > 1) {
      xx = this.x2;
      yy = this.y2;
    } else {
      xx = this.x1 + param * C;
      yy = this.y1 + param * D;
    }

    // Is the distance to the nearest point less than half the width?
    const dx = point.x - xx;
    const dy = point.y - yy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    return dist <= this.width / 2;
  }
}

module.exports = RoundedLine;
