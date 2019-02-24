/*
 * WAMS - An API for Multi-Surface Environments
 *
 * Author: Michael van der Kamp
 *  |-> Date: February 2019
 */

'use strict';

/**
 * An internal port of the Westures library (v0.5.3), adjusted so that it can
 * operate on the server with events coming from disparate clients.
 *
 * @module gestures
 */
const Gesture = require('./gestures/core/Gesture.js');
const Point2D = require('./gestures/core/Point2D.js');
const Region  = require('./gestures/core/Region.js');
const Pan     = require('./gestures/gestures/Pan.js');
const Pinch   = require('./gestures/gestures/Pinch.js');
const Rotate  = require('./gestures/gestures/Rotate.js');
const Swipe   = require('./gestures/gestures/Swipe.js');
const Swivel  = require('./gestures/gestures/Swivel.js');
const Tap     = require('./gestures/gestures/Tap.js');
const Track   = require('./gestures/gestures/Track.js');

module.exports = {
  Gesture,
  Point2D,
  Region,
  Pan,
  Pinch,
  Rotate,
  Swipe,
  Swivel,
  Tap,
  Track,
};

/**
 * Here are the return "types" of the gestures that are included in this
 * package.
 *
 * @namespace ReturnTypes
 * @memberof module:gestures
 */

/**
 * The base data that is included for all emitted gestures.
 *
 * @typedef {Object} BaseData
 *
 * @property {Event} event - The input event which caused the gesture to be
 *    recognized.
 * @property {string} phase - 'start', 'move', or 'end'.
 * @property {string} type - The name of the gesture as specified by its
 *    designer.
 * @property {Element} target - The bound target of the gesture.
 *
 * @memberof module:gestures.ReturnTypes
 */

