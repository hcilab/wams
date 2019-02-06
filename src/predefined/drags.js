/*
 * WAMS - An API for Multi-Surface Environments
 *
 * Author: Michael van der Kamp
 *  |-> Date: December 2018
 */

'use strict';

const { isView, isIncludedIn } = require('./utilities.js');

/**
 * Returns a WAMS drag handler function which will allow users to move their
 * view around the workspace, but not move items.
 *
 * workspace: The WorkSpace for which this function will be built.
 */
function view(workspace) {
  return function drag_view(view, target, x, y, dx, dy) {
    if (isView(target, view)) {
      view.moveBy(-dx, -dy);
      workspace.scheduleUpdate(view);
    }
  };
}

/**
 * Returns a WAMS drag handler function which will allow users to move items
 * around the workspace, but their view will be fixed in place.
 *
 * workspace: The WorkSpace for which this function will be built.
 */
function items(workspace, itemTypes = []) {
  return function drag_item(view, target, x, y, dx, dy) {
    if (isIncludedIn(target, itemTypes)) {
      target.moveBy(dx, dy);
      workspace.scheduleUpdate(target);
    }
  };
}

/**
 * Returns a WAMS drag handler function which will allow users to move their
 * view around the workspace and also move items.
 *
 * workspace: The WorkSpace for which this function will be built.
 */
function itemsAndView(workspace, itemTypes = []) {
  return function drag_itemAndView(view, target, x, y, dx, dy) {
    if (isView(target, view)) {
      view.moveBy(-dx, -dy);
      workspace.scheduleUpdate(view);
    } else if (isIncludedIn(target, itemTypes)) {
      target.moveBy(dx, dy);
      workspace.scheduleUpdate(target);
    }
  };
}

module.exports = {
  view,
  items,
  itemsAndView,
};

