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
 * Generates a handler that places users in a line, with the given amount of
 * overlap. Best used with either server-side gestures or when users are unable
 * to manipulate their views.
 * - Valid for use with server-side gestures.
 *
 * @memberof module:predefined.layouts
 *
 * @param {number} overlap
 *
 * @returns {module:server.ListenerTypes.LayoutListener} A WAMS layout handler
 * function that places users in a line.
 */
function line(overlap) {
  const views = [];
  const rights = [];

  function layout(view, position, device) {
    if (position > 0) {
      if (views[position - 1] == null) {
        setTimeout(() => layout(view, position, device), 0);
      } else {
        const prev = views[position - 1];
        const change = prev.transformPointChange(overlap, 0);
        const anchor = prev.topRight.minus(change);
        view.moveTo(anchor.x, anchor.y);
        const side = rights[position - 1] - overlap;
        device.moveTo(side, 0);
        rights[position] = side + device.width;
        views[position] = view;
      }
    } else {
      rights[0] = device.width;
      views[position] = view;
    }
  }

  return layout;
}

/**
 * Generates a handler that places all new users at the given coordinates.
 *
 * @memberof module:predefined.layouts
 *
 * @param {number} x
 * @param {number} y
 *
 * @returns {module:server.ListenerTypes.LayoutListener} A WAMS layout handler
 * function which will place all new users at the given (x,y) coordinates.
 */
function placeAtXY(x, y) {
  return function layout_placeAtXY(view) {
    view.moveTo(x, y);
  };
}

module.exports = {
  line,
  placeAtXY,
};

