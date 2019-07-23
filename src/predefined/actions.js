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
    const item = event.target.parent || event.target;
    item.moveBy(event.dx, event.dy);
}

/**
 * Rotates the target.
 *
 * @memberof module:predefined.actions
 *
 * @param {object} event
 */
function rotate(event) {
    event.target.rotateBy(event.rotation, event.x, event.y);
}

/**
 * Scales the target.
 *
 * @memberof module:predefined.actions
 *
 * @param {object} event
 */
function scale(event) {
    event.target.scaleBy(event.scale, event.x, event.y);
}

module.exports = Object.freeze({
    drag,
    rotate,
    scale,
});