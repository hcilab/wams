/*
 * WAMS - An API for Multi-Surface Environments
 *
 * Author: Michael van der Kamp
 *  |-> Date: December 2018
 */

'use strict';

/**
 * Utilities for the predefined module.
 *
 * @namespace utilities
 * @memberof module:predefined
 */

/**
 * Helper function to determine whether the target should be the view.
 *
 * @memberof module:predefined.utilities
 *
 * @param {( module:server.ServerItem | module:server.ServerView )} target -
 * Target to check.
 * @param {( module:server.ServerItem | module:server.ServerView )} view - View
 * to compare against.
 *
 * @return {boolean} True if the target should be considered the view. False
 * otherwise. Be warned: the target may not actually BE the view! Use the view
 * object in all subsequent actions, not the target.
 */
function isView(target, view) {
  return target == null || target === view;
}

/**
 * Helper function to determine if a target is included in a list of target
 * types.
 *
 * @memberof module:predefined.utilities
 *
 * @param {( module:server.ServerItem | module:server.ServerView )} target -
 * Target to check.
 * @param {string[]} itemTypes - The item types to check against.
 *
 * @return {boolean} True if the target has one of the types included in the
 * itemTypes list. False otherwise.
 */
function isIncludedIn(target, itemTypes) {
  return target != null && itemTypes.includes(target.type);
}

module.exports = {
  isView,
  isIncludedIn,
};

