/*
 * WAMS - An API for Multi-Surface Environments
 *
 * Author: Michael van der Kamp
 *  |-> Date: December 2018
 */

'use strict';

const { CanvasBlueprint } = require('canvas-sequencer');
const sizeOfImage = require('image-size');

const Polygon2D  = require('../server/Polygon2D.js');

function transformed(data = {}) {
  if (data.hitbox) {
    if (data.rotation)  data.hitbox.rotate(-data.rotation);
    if (data.scale)     data.hitbox.scale(data.scale);
  }
  return data;
}

/**
 * Returns a 4-point polygon representing a rectangle anchored at (0,0) and with
 * the given width and height.
 */
function rectangularHitbox(width, height) {
  return new Polygon2D([
    { x: 0,     y: 0 },
    { x: width, y: 0 },
    { x: width, y: height },
    { x: 0,     y: height },
  ]);
}
  
/**
 * Returns an object with the parameters for an image item using the given
 * source.
 */
function image(imgsrc, itemOptions = {}) {
  const dims = sizeOfImage(imgsrc);
  const scale = itemOptions.scale || 1;
  const hitbox = rectangularHitbox(dims.width * scale, dims.height * scale);
  return transformed({ ...itemOptions, imgsrc, hitbox });
}

/**
 * Returns an object with the parameters for a rectangular item with the given
 * width and height, filled in with the given colour.
 */
function rectangle(width, height, colour = 'blue', itemOptions = {}) {
  const hitbox = rectangularHitbox(width, height);
  const blueprint = new CanvasBlueprint();
  blueprint.fillStyle = colour;
  blueprint.fillRect(0, 0, width, height);
  
  return transformed({ ...itemOptions, hitbox, blueprint });
}

/**
 * Returns an object with the parameters for a square item with the given side
 * length, filled in with the given colour.
 */
function square(length, colour = 'red', itemOptions = {}) {
  return rectangle(length, length, colour, itemOptions);
}

/**
 * Returns an object with the parameters for a generic polygon, filled in with
 * the given colour.
 */
function polygon(points = [], colour = 'green', itemOptions = {}) {
  if (points.length < 3) return null;

  const hitbox = new Polygon2D(points);

  const blueprint = new CanvasBlueprint();
  blueprint.fillStyle = colour;
  blueprint.beginPath();
  blueprint.moveTo(points[0].x, points[0].y);
  points.forEach( p => blueprint.lineTo(p.x, p.y));
  blueprint.closePath();
  blueprint.fill();

  return transformed({ ...itemOptions, hitbox, blueprint });
}

module.exports = {
  image,
  polygon,
  rectangle,
  square,
};

