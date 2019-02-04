/*
 * Utilities for the WAMS application.
 *
 * Author: Michael van der Kamp
 * Date: July / August 2018
 */

/**
 * Intended for use by both the client and the server, in order to provide a
 * common interface.
 *
 * @module shared
 */

'use strict';

const IdStamper = require('./shared/IdStamper.js');
const Message   = require('./shared/Message.js');
const Reporters = require('./shared/Reporters.js');
const Utils     = require('./shared/util.js');

/*
 * This object stores a set of core constants for use by both the client and
 *  the server.
 */
const constants = Object.freeze({
  // General constants
  ROTATE_0:   0,
  ROTATE_90:  Math.PI / 2,
  ROTATE_180: Math.PI,
  ROTATE_270: Math.PI * 1.5,
  ROTATE_360: Math.PI * 2,

  // Namespaces
  NS_WAMS:  '/wams',
});

/*
 * A list of colours, for use by the API for shadows, and by end-point apps too
 * if desired.
 */
const colours = [
  'saddlebrown',
  'red',
  'blue',
  'darkgreen',
  'darkorange',
  'purple',
  'yellow',
  'aqua',
  'lime',
  'fuchsia',
];

/*
 * Package up the module and freeze it for delivery.
 */
module.exports = Object.freeze({
  colours,
  constants,
  IdStamper,
  Message,
  ...Reporters,
  ...Utils,
});

