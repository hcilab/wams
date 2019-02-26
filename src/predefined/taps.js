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
 * Modifies an item.
 *
 * @callback TapItemModifier
 * @memberof module:predefined.taps
 *
 * @param {module:server.ServerItem} target : The item to modify.
 * @param {number} id : The id of the view from which the tap originated.
 */

/**
 * Generates a tap handler that spawns items described by the provided callback
 * at the location of the tap.
 *
 * @memberof module:predefined.taps
 *
 * @param {module:server.Application} app - The Application instance for which
 * this function will be built.
 * @param {module:predefined.taps.TapItemDescriber} item_fn - Function that
 * returns item descriptions.
 *
 * @returns {module:server.ListenerTypes.ClickListener} A WAMS tap handler
 * function which will spawn a new item every time a user taps anywhere in the
 * workspace.
 */
function spawnItem(app, item_fn) {
  return function tap_spawnItem(view, target, x, y) {
    app.spawnItem(item_fn(x, y, view));
  };
}

/**
 * Generates a tap handler that removes an item of the given type if it is the
 * target of the tap, otherwise spawns an item as described by the provided
 * callback function at the location of the tap.
 *
 * @memberof module:predefined.taps
 *
 * @param {module:server.Application} app - The Application instance for which
 * this function will be built.
 * @param {module:predefined.taps.TapItemDescriber} item_fn - Function that
 * returns item descriptions.
 * @param {string} type - Type of item that can be removed.
 *
 * @returns {module:server.ListenerTypes.ClickListener} A WAMS tap handler
 * function which will remove the targeted item if it has the given type.
 * Otherwise will spawn a new item at the tap location.
 */
function spawnOrRemoveItem(app, item_fn, type) {
  return function tap_spawnOrRemoveItem(view, target, x, y) {
    if (isIncludedIn(target, [type])) {
      app.removeItem(target);
      if (target === view.lockedItem) {
        view.obtainLockOnItem(view);
      }
    } else {
      app.spawnItem(item_fn(x, y, view));
    }
  };
}

/**
 * Returns a WAMS tap handler function which will spawn modify an existing item
 * of the given type according to the given function.
 *
 * @memberof module:predefined.taps
 *
 * @param {module:server.Application} app - The Application instance for which
 * this function will be built.
 * @param {module:predefined.taps.TapItemModifier} modify_fn - Function which
 * will modify the target item.
 * @param {string} type - Type of item that can be modified.
 *
 * @returns {module:server.ListenerTypes.ClickListener} A WAMS tap handler
 * function which will modify the targeted item if it has the given type.
 */
function modifyItem(app, modify_fn, type) {
  return function tap_modifyItem(view, target) {
    if (isIncludedIn(target, [type])) {
      modify_fn(target, view);
      app.scheduleUpdate(target);
    }
  };
}

module.exports = {
  spawnItem,
  spawnOrRemoveItem,
  modifyItem,
};

