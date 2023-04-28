'use strict';

/**
 * Utilities for the predefined module.
 *
 * @namespace utilities
 * @memberof module:predefined
 */

/**
 * Generates an array of random points, with the first one always being the
 * origin (0,0).
 *
 * @memberof module:predefined.utilities
 *
 * @param {number} x - The length of the points array to return.
 * @param {number} lim - The points will vary within +-(lim/2)
 *
 * @return {module:shared.Point2D[]} Array of random points, starting with
 * (0,0).
 */
function randomPoints(x = 5, lim = 256) {
  const points = [{ x: 0, y: 0 }];
  const offset = lim / 2;
  for (let i = 1; i < x; ++i) {
    points.push({
      x: Math.random() * lim - offset,
      y: Math.random() * lim - offset,
    });
  }
  return points;
}

module.exports = {
  randomPoints,
};
