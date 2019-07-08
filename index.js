/*
 * WAMS - An API for Multi-Surface Environments
 *
 * Author: Michael van der Kamp
 *  |-> Date: July/August 2018
 */

'use strict';

const { CanvasSequence }                 = require('canvas-sequencer');
const { colours, Rectangle, Polygon2D }  = require('./src/shared.js');
const { Router, Application }            = require('./src/server.js');
const predefined                         = require('./src/predefined.js');

module.exports = {
  CanvasSequence,
  predefined,
  colours,
  Rectangle,
  Polygon2D,
  Router,
  Application,
};

