/*
 * WAMS - An API for Multi-Surface Environments
 *
 * Author: Michael van der Kamp
 *  |-> Date: December 2018
 */

'use strict';

/**
 * Returns a WAMS rotate handler function which will allow users to rotate their
 * view.
 *
 * workspace: The WorkSpace for which this function will be built.
 */
function view(workspace) {
  return function rotate_view(view, radians, px, py) {
    view.rotateBy(radians, px, py);
    workspace.update(view);
  };
}

module.exports = {
  view,
};

