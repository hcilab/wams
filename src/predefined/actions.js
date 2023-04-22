/*
 * WAMS - An API for Multi-Surface Environments
 *
 * Author: Michael van der Kamp
 *  |-> Date: December 2018
 */

'use strict';

/**
 * Transformation actions for items.
 *
 * @namespace actions
 * @memberof module:predefined
 */

/**
 * Drags the group or target.
 *
 * @memberof module:predefined.actions
 *
 * @param {object} event
 */
function drag(event) {
  let { dx, dy } = event;
  const item = event.target.parent || event.target;
  if (isView(item)) {
    dx = -dx;
    dy = -dy;
  }
  item.moveBy(dx, dy);
}

/**
 * Rotates the target.
 *
 * @memberof module:predefined.actions
 *
 * @param {object} event
 */
function rotate(event) {
  let { rotation, x, y } = event;
  const item = event.target;
  if (isView(item)) {
    rotation = -rotation;
  }
  event.target.rotateBy(rotation, x, y);
}

/**
 * Scales the target.
 *
 * @memberof module:predefined.actions
 *
 * @param {object} event
 */
function pinch(event) {
  event.target.scaleBy(event.scale, event.x, event.y);
}
const scale = pinch;

/**
 * Says if an item is a View instance.
 *
 * @param {*} item
 */
function isView(item) {
  const itemClass = item.constructor.name;
  const viewConstructors = ['ServerView', 'ServerViewGroup'];
  return viewConstructors.indexOf(itemClass) > -1;
}

module.exports = Object.freeze({
  drag,
  rotate,
  scale,
  pinch,
});
