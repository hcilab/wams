/*
 * WAMS - An API for Multi-Surface Environments
 *
 * Author: Michael van der Kamp
 *  |-> Date: December 2018
 */

'use strict';

const { CanvasSequence } = require('canvas-sequencer');
const { Circle, Polygon2D, Rectangle } = require('../shared.js');

/**
 * Factories for predefined items.
 *
 * @namespace items
 * @memberof module:predefined
 */

/**
 * Provides an image description, complete with a hitbox only if both 'width'
 * and 'height' properties are present. Note that the hitbox will be
 * rectangular, with the top left corner at the 'x' and 'y' coordinates.
 *
 * @memberof module:predefined.items
 *
 * @param {string} src - Route path to the image.
 * @param {Object} properties - Location and orientation options for the image
 * item. See {@link module:shared.Item} members for available parameters.
 *
 * @returns {Object} An object with the parameters for an image item using the
 * given source.
 */
function image(src, properties = {}) {
  let hitbox = null;
  if ('width' in properties && 'height' in properties) {
    hitbox = new Rectangle(properties.width, properties.height);
  }
  const type = 'item/image';
  return { ...properties, src, hitbox, type };
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
 * @param {Object} properties - Location and orientation options for the item.
 * See {@link module:shared.Item} members for available parameters.
 *
 * @returns {Object} An object with the parameters for a rectangular item with
 * the given width and height, filled in with the given colour.
 */
function rectangle(x, y, width, height, colour = 'blue', properties = {}) {
  const hitbox = new Rectangle(width, height, 0, 0);
  const sequence = new CanvasSequence();
  sequence.fillStyle = colour;
  sequence.fillRect(0, 0, width, height);
  const type = 'item';

  return { ...properties, x, y, hitbox, sequence, type };
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
 * @param {Object} properties - Location and orientation options for the item.
 * See {@link module:shared.Item} members for available parameters.
 *
 * @returns {Object} An object with the parameters for a square item with the
 * given side length, filled in with the given colour.
 */
function square(x, y, length, colour = 'red', properties = {}) {
  return rectangle(x, y, length, length, colour, properties);
}

/**
 * Generate a circle item.
 *
 * @memberof module:predefined.items
 *
 * @param {number} x
 * @param {number} y
 * @param {number} radius
 * @param {string} [colour='yellow'] - Fill colour for the circle.
 * @param {Object} properties - Location and orientation options for the item.
 * See {@link module:shared.Item} members for available parameters.
 *
 * @returns {Object} An object with the parameters for a circle item with the
 * given radius, filled in with the given colour.
 */
function circle(x, y, radius, colour = 'yellow', properties = {}) {
  const hitbox = new Circle(radius, x, y);
  const sequence = new CanvasSequence();
  sequence.fillStyle = colour;
  sequence.beginPath();
  sequence.arc(0, 0, radius, 0, 2 * Math.PI);
  sequence.fill();
  const type = 'item';

  return { ...properties, x, y, hitbox, sequence, type };
}

/**
 * Generate a polygonal item.
 *
 * @memberof module:predefined.items
 *
 * @param {module:shared.Point2D[]} points - Not necessarily actual Point2D
 * objects, can just be objects with x and y properties.
 * @param {string} [colour='green'] - Fill colour for the polygon.
 * @param {Object} properties - Location and orientation options for the item.
 * See {@link module:shared.Item} members for available parameters.
 *
 * @returns {Object} An object with the parameters for a generic polygon, filled
 * in with the given colour.
 */
function polygon(points = [], colour = 'green', properties = {}) {
  if (points.length < 3) throw Error('Polygon must consist of at least 3 points');

  const hitbox = new Polygon2D(points);

  const sequence = new CanvasSequence();
  sequence.fillStyle = colour;
  sequence.strokeStyle = 'black';
  sequence.beginPath();
  sequence.moveTo(points[0].x, points[0].y);
  points.forEach((p) => sequence.lineTo(p.x, p.y));
  sequence.closePath();
  sequence.fill();
  sequence.stroke();

  const type = 'item';

  return { ...properties, hitbox, sequence, type };
}

/**
 * Generate a rectangular element.
 *
 * @memberof module:predefined.items
 *
 * @param {number} x
 * @param {number} y
 * @param {number} width
 * @param {number} height
 * @param {Object} properties - Location and orientation options for the item,
 * plus any appropriate attributes.
 * See {@link module:shared.WamsElement} members for available parameters.
 *
 * @returns {Object} An object with the parameters for a rectangular item with
 * the given width and height, filled in with the given colour.
 */
function element(x, y, width, height, properties = {}) {
  const hitbox = new Rectangle(width, height, x, y);
  const type = 'item';

  return { ...properties, hitbox, type };
}

/**
 * Generate an item that wraps the given html.
 *
 * @memberof module:predefined.items
 *
 * @param {number} width
 * @param {number} height
 * @param {Object} properties - Location and orientation options for the item,
 * plus any appropriate attributes.
 * See {@link module:shared.WamsElement} members for available parameters.
 *
 * @returns {Object} An object with the parameters for an iframe with the given
 * HTML content.
 */
function html(html, width, height, properties = {}) {
  const hitbox = new Rectangle(width, height);
  const baseattrs = properties.attributes || {};
  const attributes = {
    ...baseattrs,
    innerHTML: html,
  };
  const tagname = 'div';
  const type = 'item/element';

  return { ...properties, hitbox, attributes, tagname, type };
}

module.exports = {
  circle,
  element,
  image,
  polygon,
  rectangle,
  square,
  html,
};
