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

  const TABLE = 0;
  const BOTTOM = 1;
  const LEFT = 2;
  const TOP = 3;
  const RIGHT = 4;

  function layoutTable(view, device) {
    table = view;
    bottomLeft = view.bottomLeft;
    bottomRight = view.bottomRight;
    topLeft = view.topLeft;
    topRight = view.topRight;
  }

  function layoutBottom(view, device) {
    view.moveTo(bottomLeft.x, bottomLeft.y - overlap);
    device.moveTo(bottomLeft.x, bottomLeft.y - overlap);
  }

  function layoutLeft(view, device) {
    view.moveTo(topLeft.x + overlap, topLeft.y);
    view.rotateBy(constants.ROTATE_90);
    device.moveTo(topLeft.x + overlap, topLeft.y);
    device.rotateBy(constants.ROTATE_90);
  }

  function layoutTop(view, device) {
    view.moveTo(topRight.x, topRight.y + overlap);
    view.rotateBy(constants.ROTATE_180);
    device.moveTo(topRight.x, topRight.y + overlap);
    device.rotateBy(constants.ROTATE_180);
  }

  function layoutRight(view, device) {
    view.moveTo(bottomRight.x - overlap, bottomRight.y);
    view.rotateBy(-constants.ROTATE_90);
    device.moveTo(bottomRight.x - overlap, bottomRight.y);
    device.rotateBy(-constants.ROTATE_90);
  }

  function dependOnTable(fn) {
    return function layoutDepender(view, device) {
      if (table == null) {
        setTimeout(() => layoutDepender(view, device), 0);
      } else {
        fn(view, device);
      }
    };
  }

  const userFns = [];
  userFns[TABLE] = layoutTable;
  userFns[BOTTOM] = dependOnTable(layoutBottom);
  userFns[LEFT] = dependOnTable(layoutLeft);
  userFns[TOP] = dependOnTable(layoutTop);
  userFns[RIGHT] = dependOnTable(layoutRight);

  function handleLayout(view, device) {
    const index = view.index > 0 ? (view.index % 4) + 1 : 0;
    userFns[index](view, device);
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
  if (overlap == undefined) {
    // or if overalap is null, since using == instead of ===
    throw new Error('overlap must be defined for line layout');
  }
  const views = [];
  const rights = [];

  function layout(view, device) {
    if (view.index > 0) {
      if (views[view.index - 1] == null) {
        setTimeout(() => layout(view, device), 0);
      } else {
        const prev = views[view.index - 1];
        const change = prev.transformPointChange(overlap, 0);
        const anchor = prev.topRight.minus(change);
        view.moveTo(anchor.x, anchor.y);

        const side = rights[view.index - 1] - overlap;
        device.moveTo(side, 0);
        rights[view.index] = side + device.width;
        views[view.index] = view;
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
