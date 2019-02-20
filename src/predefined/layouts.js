/*
 * WAMS - An API for Multi-Surface Environments
 *
 * Author: Michael van der Kamp
 *  |-> Date: December 2018
 */

'use strict';

/**
 * Factories for predefined layout handlers.
 *
 * @namespace layouts
 * @memberof module:predefined
 */

/**
 * Generates a handler
 *
 * @memberof module:predefined.layouts
 *
 * @param {module:server.Wams} wams - The Wams instance for which this function
 * will be built.
 * @param {number} x
 * @param {number} y
 *
 * @returns {module:server.ListenerTypes.LayoutListener} A WAMS layout handler
 * function which will place all new users at the given (x,y) coordinates.
 */
function placeAtXY(wams, x, y) {
  return function layout_placeAtXY(view) {
    view.moveTo(x, y);
  };
}

module.exports = {
  placeAtXY,
};

