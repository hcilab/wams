/*
 * WAMS - An API for Multi-Surface Environments
 *
 * Author: Michael van der Kamp
 *  |-> Date: December 2018
 */

'use strict';

/**
 * Returns a WAMS scale handler function which will allow users to scale their
 * view.
 *
 * workspace: The WorkSpace for which this function will be built.
 */
function view(workspace) {
  return function scale_view(view, scale, mx, my) {
    view.scaleBy(scale, mx, my);
    workspace.update(view);
  };
}

module.exports = {
  view,
};

