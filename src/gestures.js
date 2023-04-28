'use strict';

/**
 * An internal port of the Westures library (v0.5.3), adjusted so that it can
 * operate on the server with events coming from disparate clients.
 *
 * <br>
 * <img
 * src =
 * "https://raw.githubusercontent.com/mvanderkamp/wams/master/graphs/
 * gestures.png"
 * style = "max-height: 300px;"
 * >
 *
 * @module gestures
 */
const { Pan, Pinch, Rotate, Swipe, Tap, Track } = require('westures');

const Region = require('./gestures/Region.js');

module.exports = {
  Region,
  Pan,
  Pinch,
  Rotate,
  Swipe,
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
 * @property {module:shared.Point2D} centroid - The current centroid of the
 * inputs.
 * @property {Event} event - The input event which caused the gesture to be
 * recognized.
 * @property {string} phase - 'start', 'move', or 'end'.
 * @property {string} type - The name of the gesture as specified by its
 * designer.
 *
 * @memberof module:gestures.ReturnTypes
 */
