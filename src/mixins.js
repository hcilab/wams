/*
 * WAMS - An API for Multi-Surface Environments
 *
 * Author: Michael van der Kamp
 */

/**
 * Mixins used by the WAMS project.
 *
 * @module mixins
 */

'use strict';

const Transformable2D = require('./mixins/Transformable2D.js');
const Lockable = require('./mixins/Lockable.js');
const Locker = require('./mixins/Locker.js');

module.exports = {
  Locker,
  Lockable,
  Transformable2D,
};

