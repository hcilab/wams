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
 * Returns a WAMS drag handler function which will allow users to move their
 * view around the workspace, but not move items.
 *
 * @memberof module:predefined.drags
 *
 * @return {module:server.ListenerTypes.DragListener}
 */
function view() {
  return function drag_view(view, target, x, y, dx, dy) {
    if (isView(target, view)) {
      view.moveBy(-dx, -dy);
    }
  };
}

/**
 * Returns a WAMS drag handler function which will allow users to move items
 * around the workspace, but their view will be fixed in place.
 *
 * @memberof module:predefined.drags
 *
 * @return {module:server.ListenerTypes.DragListener}
 */
function items(itemTypes = []) {
  return function drag_item(view, target, x, y, dx, dy) {
    if (isIncludedIn(target, itemTypes)) {
      target.moveBy(dx, dy);
    }
  };
}

/**
 * Returns a WAMS drag handler function which will allow users to move their
 * view around the workspace and also move items.
 *
 * @memberof module:predefined.drags
 *
 * @return {module:server.ListenerTypes.DragListener}
 */
function itemsAndView(itemTypes = []) {
  return function drag_itemAndView(view, target, x, y, dx, dy) {
    if (isView(target, view)) {
      view.moveBy(-dx, -dy);
    } else if (isIncludedIn(target, itemTypes)) {
      target.moveBy(dx, dy);
    }
  };
}

module.exports = {
  view,
  items,
  itemsAndView,
};

