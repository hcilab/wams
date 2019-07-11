/*
 * WAMS - An API for Multi-Surface Environments
 *
 * Author: Michael van der Kamp
 *  |-> Date: December 2018
 */

'use strict';

const { constants } = require('../shared.js');

/**
 * Factories for predefined layout handlers.
 *
 * @namespace layouts
 * @memberof module:predefined
 */

/**
 * Generates a handler that places users around a table, with the given amount
 * of overlap. The first user will be the "table", and their position when they
 * join is stamped as the outline of the table. The next four users are
 * positioned, facing inwards, around the four sides of the table.
 *
 * @memberof module:predefined.layouts
 *
 * @param {number} overlap
 *
 * @returns {module:server.ListenerTypes.LayoutListener} A WAMS layout handler
 * function that places users around a table.
 */
function table(overlap) {
  let table = null;
  let bottomLeft = null;
  let bottomRight = null;
  let topLeft = null;
  let topRight = null;

  const TABLE   = 0;
  const BOTTOM  = 1;
  const LEFT    = 2;
  const TOP     = 3;
  const RIGHT   = 4;

  function layoutTable(view) {
    table = view;
    bottomLeft = view.bottomLeft;
    bottomRight = view.bottomRight;
    topLeft = view.topLeft;
    topRight = view.topRight;
  }

  function layoutBottom(view) {
    view.moveTo(bottomLeft.x, bottomLeft.y - overlap);
  }

  function layoutLeft(view) {
    view.moveTo(topLeft.x + overlap, topLeft.y);
    view.rotateBy(constants.ROTATE_270);
  }

  function layoutTop(view) {
    view.moveTo(topRight.x, topRight.y + overlap);
    view.rotateBy(constants.ROTATE_180);
  }

  function layoutRight(view) {
    view.moveTo(bottomRight.x - overlap, bottomRight.y);
    view.rotateBy(constants.ROTATE_90);
  }

  function dependOnTable(fn) {
    return function layoutDepender(view) {
      if (table == null) {
        setTimeout(() => layoutDepender(view), 0);
      } else {
        fn(view);
      }
    };
  }

  const user_fns = [];
  user_fns[TABLE]   = layoutTable;
  user_fns[BOTTOM]  = dependOnTable(layoutBottom);
  user_fns[LEFT]    = dependOnTable(layoutLeft);
  user_fns[TOP]     = dependOnTable(layoutTop);
  user_fns[RIGHT]   = dependOnTable(layoutRight);

  function handleLayout(view) {
    const index = view.index > 0 ? (view.index % 4) + 1 : 0;
    user_fns[index](view);
  }

  return handleLayout;
}

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
      views[0] = view;
    }
  }

  return layout;
}

module.exports = {
  line,
  table,
};

