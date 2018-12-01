/*
 * WAMS - An API for Multi-Surface Environments
 *
 * Author: Michael van der Kamp
 *  |-> Date: December 2018
 */

'use strict';

function placeAtXY(workspace, x, y) {
  return function layout_placeAtXY(view, position) {
    view.moveTo(x, y);
    workspace.update(view);
  };
}

module.exports = {
  placeAtXY,
};

