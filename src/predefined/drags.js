/*
 * WAMS - An API for Multi-Surface Environments
 *
 * Author: Michael van der Kamp
 *  |-> Date: December 2018
 */

'use strict';

function dragView(workspace) {
  return function drag_dragView(view, target, x, y, dx, dy) {
    if (target === view) {
      view.moveBy(-dx, -dy);
      workspace.update(view);
    }
  };
}

function dragItems(workspace, itemTypes = []) {
  return function drag_dragItem(view, target, x, y, dx, dy) {
    if (itemTypes.includes(target.type)) {
      target.moveBy(dx, dy);
      workspace.update(target);
    }
  };
}

function dragItemsOrView(workspace, itemTypes = []) {
  return function drag_dragItemOrView(view, target, x, y, dx, dy) {
    if (itemTypes.includes(target.type)) {
      target.moveBy(dx, dy);
    } else {
      target.moveBy(-dx, -dy);
    }
    workspace.update(target);
  };
}

module.exports = {
  dragView,
  dragItems,
  dragItemsOrView,
};

