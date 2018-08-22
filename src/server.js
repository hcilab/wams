/*
 * WAMS - An API for Multi-Surface Environments
 *
 * Author: Michael van der Kamp
 *  |-> Date: July/August 2018
 *
 * Original author: Jesse Rolheiser
 * Other revisions and supervision: Scott Bateman
 */

'use strict';

const WamsServer = require('./server/WamsServer.js');
const { CanvasBlueprint } = require('canvas-sequencer');

WamsServer.Sequence = CanvasBlueprint;

module.exports = WamsServer;

