/*
 * WAMS - An API for Multi-Surface Environments
 *
 * Author: Michael van der Kamp
 *  |-> Date: December 2018
 */

'use strict';

/**
 * Helper function to determine whether the target should be the view.
 */
function isView(target, view) {
  return target == null || target === view;
}

/**
 * Helper function to determine if a target is included in a list of target
 * types.
 */
function isIncludedIn(target, itemTypes) {
  return target != null && itemTypes.includes(target.type);
}

module.exports = {
  isView,
  isIncludedIn,
};

