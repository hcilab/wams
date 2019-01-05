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
 * Returns an object with the parameters for a rectangular item with the given
 * width and height.
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
  blueprint.fillRect(0, 0, width, height);
  
  return { x, y, hitbox, type, blueprint };
}

/**
 * Returns an object with the parameters for a square item with the given width
 * and height.
 */
function square(x, y, length, type = 'square', colour = 'red') {
  return rectangle(x, y, length, length, type, colour);
}

/**
 * Returns an object with the parameters for a generic polygon.
 */
function polygon(x, y, points = [], type = 'polygon', colour = 'green') {
  if (points.length < 3) return null;

  const hitbox = new Polygon2D(points);

  const blueprint = new CanvasBlueprint();
  blueprint.fillStyle = colour;
  blueprint.beginPath();
  blueprint.moveTo(points[0].x, points[0].y);
  points.forEach( p => blueprint.lineTo(p.x, p.y));
  blueprint.closePath();
  blueprint.fill();

  return { x, y, hitbox, type, blueprint };
}

module.exports = {
  polygon,
  rectangle,
  square,
};

