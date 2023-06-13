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
   * @see {@link https://stackoverflow.com/a/6853926/20044396}
   * @see {@link https://web.archive.org/web/20210507021429/https://geomalgorithms.com/a02-_lines.html}
   *
   * @param {module:shared.Point2D} point - The point to test.
   *
   * @return {boolean} true if the point is inside the line, false otherwise.
   */
  contains(point) {
    // This is blatantly ripped from the stack overflow response provided above
    // with comments and renamed variables to try to clarify.

    // Distance to first endpoint
    const dx1 = point.x - this.x1;
    const dy1 = point.y - this.y1;

    // Length of line components
    const lengthX = this.x2 - this.x1;
    const lengthY = this.y2 - this.y1;

    // Find the "projection distance" - the fraction along the line from (x1, y1) towards (x2, y2)
    // that is closest to the point
    const dot = dx1 * lengthX + dy1 * lengthY;
    const lengthSquared = lengthX * lengthX + lengthY * lengthY;
    let projectionDistance = -1;
    if (lengthSquared !== 0)
      // in case of 0-length line
      projectionDistance = dot / lengthSquared;

    // Find the nearest point along the line
    let xx, yy;
    if (projectionDistance < 0) {
      xx = this.x1;
      yy = this.y1;
    } else if (projectionDistance > 1) {
      xx = this.x2;
      yy = this.y2;
    } else {
      xx = this.x1 + projectionDistance * lengthX;
      yy = this.y1 + projectionDistance * lengthY;
    }

    // Is the distance to the nearest point less than half the width?
    const dx = point.x - xx;
    const dy = point.y - yy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    return dist <= this.width / 2;
  }
}

module.exports = RoundedLine;
