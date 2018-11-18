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

const Wams = require('./server/Wams.js');
const { CanvasBlueprint } = require('canvas-sequencer');

Wams.Sequence = CanvasBlueprint;

module.exports = Wams;

