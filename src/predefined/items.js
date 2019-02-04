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
function rectangularHitbox(x, y, width, height) {
  return new Polygon2D([
    { x: x,         y: y },
    { x: x + width, y: y },
    { x: x + width, y: y + height },
    { x: x,         y: y + height },
  ]);
}

/**
 * Returns an object with the parameters for an image item using the given
 * source.
 *
 * NOTE: This function should only be used for images that are intended to be
 * interactable! If you want an image that shouldn't be interacted with, simply
 * spawn an item directly with the itemOptions (including the imgsrc as a
 * property) that you would have supplied here.
 */
function image(imgsrc, itemOptions = {}) {
  const dims = sizeOfImage(imgsrc);
  const hitbox = rectangularHitbox(0, 0, dims.width, dims.height);
  return transformed({ ...itemOptions, imgsrc, hitbox });
}

/**
 * Returns an object with the parameters for a rectangular item with the given
 * width and height, filled in with the given colour.
 */
function rectangle(x, y, width, height, colour = 'blue', itemOptions = {}) {
  const hitbox = rectangularHitbox(x, y, width, height);
  const blueprint = new CanvasBlueprint();
  blueprint.fillStyle = colour;
  blueprint.fillRect(x, y, width, height);

  return transformed({ ...itemOptions, hitbox, blueprint });
}

/**
 * Returns an object with the parameters for a square item with the given side
 * length, filled in with the given colour.
 */
function square(x, y, length, colour = 'red', itemOptions = {}) {
  return rectangle(x, y, length, length, colour, itemOptions);
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
  points.forEach(p => blueprint.lineTo(p.x, p.y));
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

