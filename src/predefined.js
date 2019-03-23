/*
 * WAMS - An API for Multi-Surface Environments
 *
 * Author: Michael van der Kamp
 *  |-> Date: July/August 2018
 */

/**
 * Bundles together the predefined callback factories.
 *
 * @module predefined
 */

'use strict';

const items   = require('./predefined/items.js');
const layouts = require('./predefined/layouts.js');
const swipes  = require('./predefined/swipes.js');
const utilities = require('./predefined/utilities.js');

/**
 * Drags the target.
 *
 * @memberof module:predefined
 *
 * @param {object} event
 */
function drag(event) {
  event.target.moveBy(event.dx, event.dy);
}

/**
 * Rotates the target.
 *
 * @memberof module:predefined
 *
 * @param {object} event
 */
function rotate(event) {
  event.target.rotateBy(event.rotation, event.x, event.y);
}

/**
 * Scales the target.
 *
 * @memberof module:predefined
 *
 * @param {object} event
 */
function scale(event) {
  event.target.scaleBy(event.scale, event.x, event.y);
}

module.exports = Object.freeze({
  drag,
  rotate,
  scale,
  items,
  layouts,
  swipes,
  utilities,
});

