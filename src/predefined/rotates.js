/*
 * WAMS - An API for Multi-Surface Environments
 *
 * Author: Michael van der Kamp
 *  |-> Date: December 2018
 */

'use strict';

const { isView, isIncludedIn } = require('./utilities.js');

/**
 * Factories for predefined rotate handlers.
 *
 * @namespace rotates
 * @memberof module:predefined
 */

/**
 * Rotates the target in the given app by the given amount.
 *
 * @inner
 * @memberof {module:predefined.drags}
 *
 * @param {module:server.Application} app - App to update.
 * @param {module:server.ServerView | module:server.ServerItem} target - Item or
 * view to update.
 * @param {number} radians - Amount of rotation to apply, in radians.
 * @param {number} px - X coordinate of pivot point.
 * @param {number} py - Y coordinate of pivot point.
 */
function do_rotate(app, target, radians, px, py) {
  target.rotateBy(radians, px, py);
  app.scheduleUpdate(target);
}

/**
 * Generate a rotate handler that will only rotate the user's view.
 *
 * @memberof module:predefined.rotates
 *
 * @param {module:server.Application} app - The Application instance for which
 * this function will be built.
 *
 * @returns {module:server.ListenerTypes.RotateListener} A WAMS rotate handler
 * function which will allow users to rotate their view.
 */
function view(app) {
  return function rotate_view(view, target, radians, px, py) {
    if (isView(target, view)) {
      do_rotate(app, view, -radians, px, py);
    }
  };
}

/**
 * Generate a rotate handler that will only rotate items with types from the
 * given list.
 *
 * @memberof module:predefined.rotates
 *
 * @param {module:server.Application} app - The Application instance for which
 * this function will be built.
 * @param {string[]} itemTypes - The item types for which to allow rotating.
 *
 * @returns {module:server.ListenerTypes.RotateListener} A WAMS rotate handler
 * function which will allow users to rotate items.
 */
function items(app, itemTypes = []) {
  return function rotate_item(view, target, radians, px, py) {
    if (isIncludedIn(target, itemTypes)) {
      do_rotate(app, target, radians, px, py);
    }
  };
}

/**
 * Generate a rotate handler that will only rotate either the view or item types
 * from the given list.
 *
 * @memberof module:predefined.rotates
 *
 * @param {module:server.Application} app - The Application instance for which
 * this function will be built.
 * @param {string[]} itemTypes - The item types for which to allow rotating.
 *
 * @returns {module:server.ListenerTypes.RotateListener} A WAMS rotate handler
 * function which will allow users to rotate items or their view.
 */
function itemsAndView(app, itemTypes = []) {
  return function rotate_itemAndView(view, target = {}, radians, px, py) {
    if (isView(target, view)) {
      do_rotate(app, view, -radians, px, py);
    } else if (isIncludedIn(target, itemTypes)) {
      do_rotate(app, target, radians, px, py);
    }
  };
}

module.exports = {
  items,
  view,
  itemsAndView,
};

