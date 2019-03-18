/*
 * WAMS - An API for Multi-Surface Environments
 *
 * Author: Michael van der Kamp
 *  |-> Date: July/August 2018
 */

'use strict';

/**
 * The API endpoint for the WAMS API. Exposes functionality to end-user.
 */

'use strict';

const { CanvasSequence }      = require('canvas-sequencer');
const { colours }             = require('./src/shared.js');
const { Router, Application } = require('./src/server.js');
const predefined              = require('./src/predefined.js');

module.exports = {
  CanvasSequence,
  predefined,
  colours,
  Router,
  Application,
};

