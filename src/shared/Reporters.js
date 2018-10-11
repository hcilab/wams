/*
 * Reporters for the WAMS application.
 *
 * Author: Michael van der Kamp
 * Date: July / August 2018
 */

'use strict';

const ReporterFactory = require('./ReporterFactory.js');

/*
 * This Item class provides a common interface between the client and 
 * the server by which the Items can interact safely.
 */
const Item = ReporterFactory([
  'x',
  'y',
  'width',
  'height',
  'type',
  'imgsrc',
  'blueprint',
]);

/*
 * This View class provides a common interface between the client and 
 * the server by which the Views can interact safely.
 */
const View = ReporterFactory([
  'x',
  'y',
  'width',
  'height',
  'type',
  'effectiveWidth',
  'effectiveHeight',
  'scale',
  'rotation',
]);

/*
 * This class is intended for sharing mouse action data between client and
 * server.
 */
const MouseReporter = ReporterFactory([
  'x',
  'y',
  'dx',
  'dy',
]);

/*
 * This class allows reporting of scale data between client and server.
 */
const ScaleReporter = ReporterFactory([
  'scale',
]);

/*
 * This class allows reporting of rotation data between client and server.
 */
const RotateReporter = ReporterFactory([
  'radians',
]);

/*
 * This class allows reporting of swipe data between client and server.
 */
const SwipeReporter = ReporterFactory([
  'acceleration',
  'velocity',
  'x',
  'y',
]);

/*
 * This class allows reporting of the full state of the model, for bringing
 * new clients up to speed (or potentially also for recovering a client, if
 * need be).
 */
const FullStateReporter = ReporterFactory([
  'views',
  'items',
  'color',
  'id',
]);

module.exports = {
  Item,
  View,
  MouseReporter,
  ScaleReporter,
  RotateReporter,
  FullStateReporter,
};

