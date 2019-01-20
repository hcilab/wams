/*
 * WAMS - An API for Multi-Surface Environments
 *
 * Author: Michael van der Kamp
 *  |-> Date: December 2018
 */

'use strict';

/**
 * Returns a WAMS rotate handler function which will allow users to rotate their
 * view.
 *
 * workspace: The WorkSpace for which this function will be built.
 */
function view(workspace) {
  return function rotate_view(view, target, radians, px, py) {
    if (target === view) {
      view.rotateBy(radians, px, py);
      workspace.scheduleUpdate(view);
    }
  };
}

/**
 * Returns a WAMS rotate handler function which will allow users to rotate
 * items.
 *
 * workspace: The WorkSpace for which this function will be built.
 * itemTypes: Array of strings, the types of items for which to allow rotating.
 */
function items(workspace, itemTypes = []) {
  return function rotate_item(view, target, radians, px, py) {
    if (itemTypes.includes(target.type)) {
      target.rotateBy(radians, px, py);
      workspace.scheduleUpdate(target);
    }
  };
}

/**
 * Returns a WAMS rotate handler function which will allow users to rotate
 * items or their view.
 *
 * workspace: The WorkSpace for which this function will be built.
 * itemTypes: Array of strings, the types of items for which to allow rotating.
 */
function itemsAndView(workspace, itemTypes = []) {
  return function rotate_itemAndView(view, target, radians, px, py) {
    if (itemTypes.includes(target.type) || view === target) {
      target.rotateBy(radians, px, py);
      workspace.scheduleUpdate(target);
    }
  };
}

module.exports = {
  items,
  view,
  itemsAndView,
};

