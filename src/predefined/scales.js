/*
 * WAMS - An API for Multi-Surface Environments
 *
 * Author: Michael van der Kamp
 *  |-> Date: December 2018
 */

'use strict';

const { isView, isIncludedIn } = require('./utilities.js');

/**
 * Factories for predefined scale handlers.
 *
 * @namespace scales
 * @memberof module:predefined
 */

/**
 * Generates a scale handler that will only scale the user's view.
 *
 * @memberof module:predefined.scales
 *
 * @returns {module:server.ListenerTypes.ScaleListener} A WAMS scale handler
 * function which will allow users to scale their view.
 */
function view() {
  return function scale_view(view, target, scale, mx, my) {
    if (isView(target, view)) {
      view.scaleBy(scale, mx, my);
    }
  };
}

/**
 * Generates a scale handler that will only scale item types from the given
 * list.
 *
 * @memberof module:predefined.scales
 *
 * @param {string[]} itemTypes - The item types for which to allow rotating.
 *
 * @returns {module:server.ListenerTypes.ScaleListener} A WAMS scale handler
 * function which will allow users to scale items.
 */
function items(itemTypes = []) {
  return function scale_item(view, target, scale, mx, my) {
    if (isIncludedIn(target, itemTypes)) {
      target.scaleBy(scale, mx, my);
    }
  };
}

/**
 * Generates a scale handler that will only scale the user's view or item types
 * from the given list.
 *
 * @memberof module:predefined.scales
 *
 * @param {string[]} itemTypes - The item types for which to allow rotating.
 *
 * @returns {module:server.ListenerTypes.ScaleListener} A WAMS scale handler
 * function which will allow users to scale items and their view.
 */
function itemsAndView(itemTypes = []) {
  return function scale_itemsAndView(view, target, scale, mx, my) {
    if (isView(target, view)) {
      view.scaleBy(scale, mx, my);
    } else if (isIncludedIn(target, itemTypes)) {
      target.scaleBy(scale, mx, my);
    }
  };
}

module.exports = {
  items,
  view,
  itemsAndView,
};

