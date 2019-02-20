/*
 * WAMS - An API for Multi-Surface Environments
 *
 * Author: Michael van der Kamp
 *  |-> Date: July/August 2018
 */

/**
 * Bundles together the server API endpoint along with the Router class for
 * custom route generation plus a set of functions for generating predefined
 * handlers and items.
 *
 * @module server
 */

'use strict';

const { CanvasBlueprint } = require('canvas-sequencer');

const predefined  = require('./predefined.js');
const { colours } = require('./shared.js');
const Router      = require('./server/Router.js');
const Wams        = require('./server/Wams.js');

Wams.Sequence   = CanvasBlueprint;
Wams.Router     = Router;
Wams.colours    = colours;
Wams.predefined = predefined;

module.exports = Wams;

