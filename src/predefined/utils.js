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
  return target == undefined || target === view;
}

module.exports = {
  isView,
};

