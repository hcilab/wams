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
const Gesture = require('core/Gesture.js');
const Point2D = require('core/Point2D.js');
const Region  = require('core/Region.js');
const Pan     = require('gestures/Pan.js');
const Pinch   = require('gestures/Pinch.js');
const Rotate  = require('gestures/Rotate.js');
const Swipe   = require('gestures/Swipe.js');
const Swivel  = require('gestures/Swivel.js');
const Tap     = require('gestures/Tap.js');
const Track   = require('gestures/Track.js');

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

