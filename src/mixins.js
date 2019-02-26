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

module.exports = {
  Lockable,
  Transformable2D,
};

