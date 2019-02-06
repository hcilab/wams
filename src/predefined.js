/*
 * WAMS - An API for Multi-Surface Environments
 *
 * Author: Michael van der Kamp
 *  |-> Date: July/August 2018
 */

/**
 * Bundles together the predefined callback factories.
 *
 * @module server
 */

'use strict';

const items   = require('./predefined/items.js');
const drags   = require('./predefined/drags.js');
const layouts = require('./predefined/layouts.js');
const rotates = require('./predefined/rotates.js');
const scales  = require('./predefined/scales.js');
const swipes  = require('./predefined/swipes.js');
const taps    = require('./predefined/taps.js');

module.exports = Object.freeze({
  items,
  drags,
  layouts,
  rotates,
  scales,
  swipes,
  taps,
});

