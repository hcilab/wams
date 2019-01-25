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
  'hitbox', // TODO: May not need to be reported
  // 'width',
  // 'height',
  'rotation',
  'scale',
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
  'scale',
  'rotation',
]);

/*
 * This class allows generic Input data reporting between client and server.
 * Honestly it's a bit of a cheaty hack around the Message / Reporter protocol,
 * but it simplifies the code and makes things easier to maintain. And honestly
 * the Message / Reporter protocol is mostly focused on protecting Views and
 * Items anyway.
 */
const DataReporter = ReporterFactory([
  'data',
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
  'phase',
]);

/*
 * This class allows reporting of scale data between client and server.
 */
const ScaleReporter = ReporterFactory([
  'scale',
  'mx',
  'my',
  'phase',
]);

/*
 * This class allows reporting of rotation data between client and server.
 */
const RotateReporter = ReporterFactory([
  'radians',
  'px',
  'py',
  'phase',
]);

/*
 * This class allows reporting of swipe data between client and server.
 */
const SwipeReporter = ReporterFactory([
  'direction',
  'velocity',
  'x',
  'y',
  'phase',
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
  DataReporter,
  MouseReporter,
  ScaleReporter,
  RotateReporter,
  SwipeReporter,
  FullStateReporter,
};

