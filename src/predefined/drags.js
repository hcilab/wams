/*
 * WAMS - An API for Multi-Surface Environments
 *
 * Author: Michael van der Kamp
 *  |-> Date: December 2018
 */

'use strict';

const { isView, isIncludedIn } = require('./utilities.js');

/**
 * Factories for predefined drag handlers.
 *
 * @namespace drags
 * @memberof module:predefined
 */

/**
 * Moves the target in the given app by the given amount.
 *
 * @inner
 * @memberof {module:predefined.drags}
 *
 * @param {module:server.Application} app - App to update.
 * @param {module:server.ServerView | module:server.ServerItem} target - Item or
 * view to update.
 * @param {number} dx - Change in X coordinate.
 * @param {number} dy - Change in Y coordinate.
 */
function do_move(app, target, dx, dy) {
  target.moveBy(dx, dy);
}

/**
 * Returns a WAMS drag handler function which will allow users to move their
 * view around the workspace, but not move items.
 *
 * @memberof module:predefined.drags
 *
 * @param {module:server.Application} app - The Application instance for which
 * this function will be built.
 *
 * @return {module:server.ListenerTypes.DragListener}
 */
function view(app) {
  return function drag_view(view, target, x, y, dx, dy) {
    if (isView(target, view)) {
      do_move(app, view, -dx, -dy);
    }
  };
}

/**
 * Returns a WAMS drag handler function which will allow users to move items
 * around the workspace, but their view will be fixed in place.
 *
 * @memberof module:predefined.drags
 *
 * @param {module:server.Application} app - The Application instance for which
 * this function will be built.
 *
 * @return {module:server.ListenerTypes.DragListener}
 */
function items(app, itemTypes = []) {
  return function drag_item(view, target, x, y, dx, dy) {
    if (isIncludedIn(target, itemTypes)) {
      do_move(app, target, dx, dy);
    }
  };
}

/**
 * Returns a WAMS drag handler function which will allow users to move their
 * view around the workspace and also move items.
 *
 * @memberof module:predefined.drags
 *
 * @param {module:server.Application} app - The Application instance for which
 * this function will be built.
 *
 * @return {module:server.ListenerTypes.DragListener}
 */
function itemsAndView(app, itemTypes = []) {
  return function drag_itemAndView(view, target, x, y, dx, dy) {
    if (isView(target, view)) {
      do_move(app, view, -dx, -dy);
    } else if (isIncludedIn(target, itemTypes)) {
      do_move(app, target, dx, dy);
    }
  };
}

module.exports = {
  view,
  items,
  itemsAndView,
};

