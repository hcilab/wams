/*
 * WAMS - An API for Multi-Surface Environments
 *
 * Author: Michael van der Kamp
 *  |-> Date: December 2018
 */

'use strict';

const { CanvasBlueprint } = require('canvas-sequencer');

const Polygon2D  = require('../server/Polygon2D.js');

/**
 * Returns a rectangular item with the given width and height.
 */
function rectangle(x, y, width, height, type = 'rectangle', colour = 'blue') {
  const hitbox = new Polygon2D([
    { x: 0,     y: 0 },
    { x: width, y: 0 },
    { x: width, y: height },
    { x: 0,     y: height },
  ]);
  const blueprint = new CanvasBlueprint();
  blueprint.fillStyle = colour;
  blueprint.fillRect('{x}', '{y}', width, height);
  
  return { x, y, hitbox, type, blueprint };
}

/**
 * Returns a square item with the given side length.
 */
function square(x, y, length, type = 'square', colour = 'red') {
  return rectangle(x, y, length, length, type, colour);
}

module.exports = {
  rectangle,
  square,
};

