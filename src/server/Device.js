/*
 * WAMS - An API for Multi-Surface Environments
 *
 * Author: Michael van der Kamp
 */

'use strict';

const { View } = require('../shared.js');
const { Transformable2D } = require('../mixins.js');

/**
 * A Device keeps track of the physical position of a device connected to an
 * application.
 *
 * @memberof module:server
 * @extends module:shared.View
 * @mixes module:mixins.Transformable2D
 */
class Device extends Transformable2D(View) {}

/**
 * The default values for a Device.
 *
 * @type {object}
 */
Device.DEFAULTS = Object.freeze({
  x:        0,
  y:        0,
  width:    1600,
  height:   900,
  scale:    1,
  rotation: 0,
  type:     'device',
});

module.exports = Device;

