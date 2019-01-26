/*
 * WAMS - An API for Multi-Surface Environments
 *
 * Author: Michael van der Kamp
 *  |-> Date: December 2018
 */

'use strict';

/**
 * Returns a WAMS layout handler function which will place all new users at the
 * given (x,y) coordinates.
 *
 * workspace: The WorkSpace for which this function will be built.
 */
function placeAtXY(workspace, x, y) {
  return function layout_placeAtXY(view, position) {
    view.moveTo(x, y);
  };
}

module.exports = {
  placeAtXY,
};

