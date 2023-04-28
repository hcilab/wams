'use strict';

const { CanvasSequence } = require('canvas-sequencer');
const { colours, Circle, Rectangle, Polygon2D } = require('./src/shared.js');
const { Router, Application } = require('./src/server.js');
const predefined = require('./src/predefined.js');

module.exports = {
  CanvasSequence,
  predefined,
  colours,
  Circle,
  Rectangle,
  Polygon2D,
  Router,
  Application,
};
