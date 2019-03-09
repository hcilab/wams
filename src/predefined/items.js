/*
 * WAMS - An API for Multi-Surface Environments
 *
 * Author: Michael van der Kamp
 *  |-> Date: December 2018
 */

'use strict';

const { CanvasBlueprint } = require('canvas-sequencer');
const { Polygon2D }  = require('../shared.js');

/**
 * Factories for predefined items.
 *
 * @namespace items
 * @memberof module:predefined
 */

/**
 * Applies rotation and scale to a hitbox, if necessary.
 *
 * @inner
 * @memberof module:predefined.items
 *
 * @param {Object} data
 * @param {module:shared.Polygon2D} [data.hitbox]
 * @param {number} [data.rotation]
 * @param {number} [data.scale]
 *
 * @returns {Object} The appropriately transformed data.
 */
function transformed(data = {}) {
  if (data.hitbox) {
    if (data.rotation)  data.hitbox.rotate(-data.rotation);
    if (data.scale)     data.hitbox.scale(data.scale);
  }
  return data;
}

/**
 * Generates a rectangular hitbox.
 *
 * @inner
 * @memberof module:predefined.items
 *
 * @param {number} x
 * @param {number} y
 * @param {number} width
 * @param {number} height
 *
 * @returns {module:shared.Polygon2D} A 4-point polygon representing a rectangle
 * anchored at (0,0) and with the given width and height.
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
 *
 * NOTE: This function should only be used for images that are intended to be
 * interactable! If you want an image that shouldn't be interacted with, simply
 * spawn an item directly with the itemOptions (including the imgsrc as a
 * property) that you would have supplied here.
 *
 * @memberof module:predefined.items
 *
 * @param {string} src - Route path to the image.
 * @param {Object} itemOptions - Location and orientation options for the image
 * item. See {@link module:shared.Item} members for available parameters.
 *
 * @returns {Object} An object with the parameters for an image item using the
 * given source.
 */
function image(src, itemOptions = {}) {
  // const dims = sizeOfImage(imgsrc);
  let hitbox = null;
  if ('width' in itemOptions && 'height' in itemOptions) {
    hitbox = rectangularHitbox(0, 0, itemOptions.width, itemOptions.height);
  }
  return transformed({ ...itemOptions, src, hitbox });
}

/**
 * Generate a rectangular block item.
 *
 * @memberof module:predefined.items
 *
 * @param {number} x
 * @param {number} y
 * @param {number} width
 * @param {number} height
 * @param {string} [colour='blue'] - Fill colour for the rectangle.
 * @param {Object} itemOptions - Location and orientation options for the item.
 * See {@link module:shared.Item} members for available parameters.
 *
 * @returns {Object} An object with the parameters for a rectangular item with
 * the given width and height, filled in with the given colour.
 */
function rectangle(x, y, width, height, colour = 'blue', itemOptions = {}) {
  const hitbox = rectangularHitbox(x, y, width, height);
  const blueprint = new CanvasBlueprint();
  blueprint.fillStyle = colour;
  blueprint.fillRect(x, y, width, height);

  return transformed({ ...itemOptions, hitbox, blueprint });
}

/**
 * Generate a square block item.
 *
 * @memberof module:predefined.items
 *
 * @param {number} x
 * @param {number} y
 * @param {number} length
 * @param {string} [colour='red'] - Fill colour for the square.
 * @param {Object} itemOptions - Location and orientation options for the item.
 * See {@link module:shared.Item} members for available parameters.
 *
 * @returns {Object} An object with the parameters for a square item with the
 * given side length, filled in with the given colour.
 */
function square(x, y, length, colour = 'red', itemOptions = {}) {
  return rectangle(x, y, length, length, colour, itemOptions);
}

/**
 * Generate a polygonal item.
 *
 * @memberof module:predefined.items
 *
 * @param {module:shared.Point2D[]} points - Not necessarily actual Point2D
 * objects, can just be objects with x and y properties.
 * @param {string} [colour='green'] - Fill colour for the polygon.
 * @param {Object} itemOptions - Location and orientation options for the item.
 * See {@link module:shared.Item} members for available parameters.
 *
 * @returns {Object} An object with the parameters for a generic polygon, filled
 * in with the given colour.
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

