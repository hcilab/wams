/*
 * WAMS - An API for Multi-Surface Environments
 *
 * Author: Michael van der Kamp
 *  |-> Date: December 2018
 */

'use strict';

const { Polygon2D }  = require('../shared.js');

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

/**
 * Generates a rectangular hitbox.
 *
 * @inner
 * @memberof module:predefined.items
 *
 * @param {number} x
 * @param {number} y
 * @param {number} width
 * @param {number} height
 *
 * @returns {module:shared.Polygon2D} A 4-point polygon representing a rectangle
 * anchored at (0,0) and with the given width and height.
 */
function rectangularHitbox(x, y, width, height) {
  return new Polygon2D([
    { x: x,         y: y },
    { x: x + width, y: y },
    { x: x + width, y: y + height },
    { x: x,         y: y + height },
  ]);
}

module.exports = {
  randomPoints,
  rectangularHitbox,
};

