/*
 * WAMS - An API for Multi-Surface Environments
 *
 * Author: Michael van der Kamp
 *  |-> Date: December 2018
 */

'use strict';

const { isIncludedIn } = require('./utilities.js');

/**
 * Factories for predefined tap handlers.
 *
 * @namespace taps
 * @memberof module:predefined
 */

/**
 * Generates an Item description object.
 *
 * @callback TapItemDescriber
 * @memberof module:predefined.taps
 * @see {@link module:shared.Item}
 *
 * @param {number} x - x coordinate of the tap.
 * @param {number} y - y coordinate of the tap.
 * @param {number} id - ID of the view from which the tap originated.
 *
 * @return {Object} Object containing values describing an item to spawn.
 */

/**
 * Generates a tap handler that spawns items described by the provided callback
 * at the location of the tap.
 *
 * @memberof module:predefined.taps
 *
 * @param {module:server.Wams} wams - The Wams instance for which this function
 * will be built.
 * @param {module:predefined.taps.TapItemDescriber} item_fn - Function that
 * returns item descriptions.
 *
 * @returns {module:server.ListenerTypes.ClickListener} A WAMS tap handler
 * function which will spawn a new item every time a user taps anywhere in the
 * workspace.
 */
function spawnItem(wams, item_fn) {
  return function tap_spawnItem(view, target, x, y) {
    wams.spawnItem(item_fn(x, y, view));
  };
}

/**
 * Generates a tap handler that removes an item of the given type if it is the
 * target of the tap, otherwise spawns an item as described by the provided
 * callback function at the location of the tap.
 *
 * @memberof module:predefined.taps
 *
 * @param {module:server.Wams} wams - The Wams instance for which this function
 * will be built.
 * @param {module:predefined.taps.TapItemDescriber} item_fn - Function that
 * returns item descriptions.
 * @param {string} type - Type of item that can be removed.
 *
 * @returns {module:server.ListenerTypes.ClickListener} A WAMS tap handler
 * function which will remove the targeted item if it has the given type.
 * Otherwise will spawn a new item at the tap location.
 */
function spawnOrRemoveItem(wams, item_fn, type) {
  return function tap_spawnOrRemoveItem(view, target, x, y) {
    if (isIncludedIn(target, [type])) {
      if (target === view.lockedItem) {
        view.releaseLockedItem();
      }
      wams.removeItem(target);
      view.getLockOnItem(view);
    } else {
      wams.spawnItem(item_fn(x, y, view));
    }
  };
}

/**
 * Returns a WAMS tap handler function which will spawn modify an existing item
 * of the given type according to the given function.
 *
 * @memberof module:server.taps
 *
 * @param {module:server.Wams} wams - The Wams instance for which this function
 * will be built.
 * modify_fn: Function which will modify the target item. Will be called with
 *            two arguments:
 *                target: The target item to modify
 *                id: id of the view from which the tap originated
 * type     : Type of item that can be modified.
 */
function modifyItem(wams, modify_fn, type) {
  return function tap_modifyItem(view, target) {
    if (isIncludedIn(target, [type])) {
      modify_fn(target, view);
      wams.update(target);
    }
  };
}

module.exports = {
  spawnItem,
  spawnOrRemoveItem,
  modifyItem,
};

