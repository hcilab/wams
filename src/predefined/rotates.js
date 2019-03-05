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
 * Generate a rotate handler that will only rotate the user's view.
 *
 * @memberof module:predefined.rotates
 *
 * @returns {module:server.ListenerTypes.RotateListener} A WAMS rotate handler
 * function which will allow users to rotate their view.
 */
function view() {
  return function rotate_view(view, target, radians, px, py) {
    if (isView(target, view)) {
      view.rotateBy(-radians, px, py);
    }
  };
}

/**
 * Generate a rotate handler that will only rotate items with types from the
 * given list.
 *
 * @memberof module:predefined.rotates
 *
 * @param {string[]} itemTypes - The item types for which to allow rotating.
 *
 * @returns {module:server.ListenerTypes.RotateListener} A WAMS rotate handler
 * function which will allow users to rotate items.
 */
function items(itemTypes = []) {
  return function rotate_item(view, target, radians, px, py) {
    if (isIncludedIn(target, itemTypes)) {
      target.rotateBy(radians, px, py);
    }
  };
}

/**
 * Generate a rotate handler that will only rotate either the view or item types
 * from the given list.
 *
 * @memberof module:predefined.rotates
 *
 * @param {string[]} itemTypes - The item types for which to allow rotating.
 *
 * @returns {module:server.ListenerTypes.RotateListener} A WAMS rotate handler
 * function which will allow users to rotate items or their view.
 */
function itemsAndView(itemTypes = []) {
  return function rotate_itemAndView(view, target = {}, radians, px, py) {
    if (isView(target, view)) {
      view.rotateBy(-radians, px, py);
    } else if (isIncludedIn(target, itemTypes)) {
      target.rotateBy(radians, px, py);
    }
  };
}

module.exports = {
  items,
  view,
  itemsAndView,
};

