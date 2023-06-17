'use strict';

const { CanvasSequence } = require('canvas-sequencer');
const { colours, Circle, Oval, Rectangle, Polygon2D } = require('./src/shared.js');
const { Application } = require('./src/server.js');
const predefined = require('./src/predefined.js');

module.exports = {
  CanvasSequence,
  predefined,
  colours,
  Circle,
  Oval,
  Rectangle,
  Polygon2D,
  Application,
};
