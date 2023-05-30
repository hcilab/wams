'use strict';

const { constants } = require('../shared.js');

/**
 * Factories for predefined layout handlers.
 *
 * @namespace layouts
 * @memberof module:predefined
 */

/**
 * Places users around a table, with the given amount of overlap. The first user
 * will be the "table", and their position when they join is stamped as the
 * outline of the table. The next four users are positioned, facing inwards,
 * around the four sides of the table.
 *
 * @memberof module:predefined.layouts
 *
 * @param {number} overlap
 */
class Table {
  TABLE = 0;
  BOTTOM = 1;
  LEFT = 2;
  TOP = 3;
  RIGHT = 4;

  constructor(overlap) {
    if (overlap == undefined) {
      // or if overalap is null, since using == instead of ===
      throw new Error('overlap must be defined for Table layout');
    }
    this.overlap = overlap;
    this.table = null;
    this.bottomLeft = null;
    this.bottomRight = null;
    this.topLeft = null;
    this.topRight = null;
  }

  layoutTable(view, device) {
    this.table = view;
    this.bottomLeft = view.bottomLeft;
    this.bottomRight = view.bottomRight;
    this.topLeft = view.topLeft;
    this.topRight = view.topRight;
  }

  layoutBottom(view, device) {
    view.moveTo(this.bottomLeft.x, this.bottomLeft.y - this.overlap);
    device.moveTo(this.bottomLeft.x, this.bottomLeft.y - this.overlap);
  }

  layoutLeft(view, device) {
    view.moveTo(this.topLeft.x + this.overlap, this.topLeft.y);
    view.rotateBy(constants.ROTATE_90);
    device.moveTo(this.topLeft.x + this.overlap, this.topLeft.y);
    device.rotateBy(constants.ROTATE_90);
  }

  layoutTop(view, device) {
    view.moveTo(this.topRight.x, this.topRight.y + this.overlap);
    view.rotateBy(constants.ROTATE_180);
    device.moveTo(this.topRight.x, this.topRight.y + this.overlap);
    device.rotateBy(constants.ROTATE_180);
  }

  layoutRight(view, device) {
    view.moveTo(this.bottomRight.x - this.overlap, this.bottomRight.y);
    view.rotateBy(-constants.ROTATE_90);
    device.moveTo(this.bottomRight.x - this.overlap, this.bottomRight.y);
    device.rotateBy(-constants.ROTATE_90);
  }

  layout(view, device) {
    const index = view.index > 0 ? (view.index % 4) + 1 : 0;
    console.log('INDEX', index);
    if (index == this.TABLE) {
      console.log('TABLE', view.index);
      this.layoutTable(view, device);
      return;
    }
    if (this.table == null) {
      // console.log('TABLE NOT SET', view.index);
      setTimeout(this.layout.bind(this, view, device), 0);
      return;
    }
    switch (index) {
      case this.BOTTOM:
        console.log('BOTTOM', view.index);
        this.layoutBottom(view, device);
        break;
      case this.LEFT:
        console.log('LEFT', view.index);
        this.layoutLeft(view, device);
        break;
      case this.TOP:
        console.log('TOP', view.index);
        this.layoutTop(view, device);
        break;
      case this.RIGHT:
        console.log('RIGHT', view.index);
        this.layoutRight(view, device);
        break;
    }
  }
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
  Table,
};
