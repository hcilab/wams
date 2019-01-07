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
    view.rotateBy(radians, px, py);
    workspace.update(view);
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
      workspace.update(target);
    }
  };
}

module.exports = {
  items,
  view,
};

