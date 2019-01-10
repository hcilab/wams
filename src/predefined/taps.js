/*
 * WAMS - An API for Multi-Surface Environments
 *
 * Author: Michael van der Kamp
 *  |-> Date: December 2018
 */

'use strict';

/**
 * Returns a WAMS tap handler function which will spawn a new item using values
 * returned by the provided item_fn every time a user taps anywhere in the
 * workspace.
 *
 * workspace: The WorkSpace for which this function will be built.
 * item_fn  : Function which will generate values with which to spawn the item.
 *            Will be called with three arguments:
 *                x : x coordinate of tap
 *                y : y coordinate of tap
 *                id: id of the view from which the tap originated
 */
function spawnItem(workspace, item_fn) {
  return function tap_spawnItem(view, target, x, y) {
    workspace.spawnItem(item_fn(x, y, view));
  };
}

/**
 * Returns a WAMS tap handler function which will spawn a new item using values
 * returned by the provided item_fn if a user taps somewhere in the workspace
 * where no recognized item is located. If an item of the given type exists at
 * the location of the tap, it is removed.
 *
 * workspace: The WorkSpace for which this function will be built.
 * item_fn  : Function which will generate values with which to spawn the item.
 *            Will be called with three arguments:
 *                x : x coordinate of tap
 *                y : y coordinate of tap
 *                id: id of the view from which the tap originated
 * type     : Type of item that can be removed.
 */
function spawnOrRemoveItem(workspace, item_fn, type) {
  return function tap_spawnOrRemoveItem(view, target, x, y) {
    if (target.type === type) {
      workspace.removeItem(target);
    } else {
      workspace.spawnItem(item_fn(x, y, view));
    }
  };
}

/**
 * Returns a WAMS tap handler function which will spawn modify an existing item
 * of the given type according to the given function.
 *
 * workspace: The WorkSpace for which this function will be built.
 * modify_fn: Function which will modify the target item. Will be called with
 *            two arguments:
 *                target: The target item to modify
 *                id: id of the view from which the tap originated
 * type     : Type of item that can be modified.
 */
function modifyItem(workspace, modify_fn, type) {
  return function tap_modifyItem(view, target, x, y) {
    if (target.type === type) {
      modify_fn(target, view);
      workspace.update(target);
    }
  };
}

module.exports = {
  spawnItem,
  spawnOrRemoveItem,
  modifyItem,
};

