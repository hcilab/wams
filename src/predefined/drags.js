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
 * @param {module:server.Wams} wams - The Wams instance for which this
 * function will be built.
 *
 * @return {module:server.ListenerTypes.DragListener}
 */
function view(wams) {
  return function drag_view(view, target, x, y, dx, dy) {
    if (isView(target, view)) {
      view.moveBy(-dx, -dy);
      wams.scheduleUpdate(view);
    }
  };
}

/**
 * Returns a WAMS drag handler function which will allow users to move items
 * around the workspace, but their view will be fixed in place.
 *
 * wams: The Wams instance for which this function will be built.
 *
 * @memberof module:predefined.drags
 *
 * @param {module:server.Wams} wams - The Wams instance for which this
 * function will be built.
 *
 * @return {module:server.ListenerTypes.DragListener}
 */
function items(wams, itemTypes = []) {
  return function drag_item(view, target, x, y, dx, dy) {
    if (isIncludedIn(target, itemTypes)) {
      target.moveBy(dx, dy);
      wams.scheduleUpdate(target);
    }
  };
}

/**
 * Returns a WAMS drag handler function which will allow users to move their
 * view around the workspace and also move items.
 *
 * wams: The Wams for which this function will be built.
 *
 * @memberof module:predefined.drags
 *
 * @param {module:server.Wams} wams - The Wams instance for which this
 * function will be built.
 *
 * @return {module:server.ListenerTypes.DragListener}
 */
function itemsAndView(wams, itemTypes = []) {
  return function drag_itemAndView(view, target, x, y, dx, dy) {
    if (isView(target, view)) {
      view.moveBy(-dx, -dy);
      wams.scheduleUpdate(view);
    } else if (isIncludedIn(target, itemTypes)) {
      target.moveBy(dx, dy);
      wams.scheduleUpdate(target);
    }
  };
}

module.exports = {
  view,
  items,
  itemsAndView,
};

