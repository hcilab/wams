/*
 * WAMS - An API for Multi-Surface Environments
 *
 * Author: Michael van der Kamp
 *  |-> Date: July/August 2018
 *
 * Bundles together the server API endpoint as well as a set of functions for
 * generating predefined handlers and items.
 */

'use strict';

const { CanvasBlueprint } = require('canvas-sequencer');

const RequestHandler = require('./server/RequestHandler.js');
const Wams    = require('./server/Wams.js');
const items   = require('./predefined/items.js');
const drags   = require('./predefined/drags.js');
const layouts = require('./predefined/layouts.js');
const rotates = require('./predefined/rotates.js');
const scales  = require('./predefined/scales.js');
const swipes  = require('./predefined/swipes.js');
const taps    = require('./predefined/taps.js');

Wams.Sequence = CanvasBlueprint;
Wams.RequestHandler = RequestHandler;
Wams.predefined = Object.freeze({
  items,
  drag:   drags,
  layout: layouts,
  rotate: rotates,
  scale:  scales,
  swipe:  swipes,
  tap:    taps,
});

module.exports = Wams;

