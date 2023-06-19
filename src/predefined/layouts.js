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
class TableLayout {
  TABLE = 0;
  BOTTOM = 1;
  LEFT = 2;
  TOP = 3;
  RIGHT = 4;

  constructor(overlap) {
    if (overlap == undefined) {
      // or if overlap is null, since using == instead of ===
      throw new Error('Overlap must be defined for TableLayout.');
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
 * Places users in a line, with the given amount of overlap. Best used with
 * either server-side gestures or when users are unable to manipulate their
 * views.
 * - Valid for use with server-side gestures.
 *
 * @memberof module:predefined.layouts
 *
 * @param {number} overlap
 */
class LineLayout {
  constructor(overlap) {
    if (overlap == undefined) {
      // or if overlap is null, since using == instead of ===
      throw new Error('Overlap must be defined for LineLayout.');
    }
    this.overlap = overlap;
    this.views = [];
    this.deviceRights = [];
  }

  layout(view, device) {
    if (view.index > 0) {
      if (this.views[view.index - 1] == null) {
        setTimeout(this.layout.bind(this, view, device), 0);
      } else {
        const prev = this.views[view.index - 1];
        const change = prev.transformPointChange(this.overlap, 0);
        const anchor = prev.topRight.minus(change);
        view.moveTo(anchor.x, anchor.y);

        const side = this.deviceRights[view.index - 1] - this.overlap;
        device.moveTo(side, 0);
        this.deviceRights[view.index] = side + device.width;
        this.views[view.index] = view;
      }
    } else {
      this.deviceRights[0] = device.width;
      this.views[0] = view;
    }
  }
}

/**
 * @deprecated
 * @param {number} overlap
 * @returns {TableLayout}
 * @memberof module:predefined.layouts
 */
function table(overlap) {
  console.warn('WARNING: `table(overlap)` is deprecated, use `new TableLayout(overlap)` instead.');
  return new TableLayout(overlap);
}

/**
 * @deprecated
 * @param {number} overlap
 * @returns {LineLayout}
 * @memberof module:predefined.layouts
 */
function line(overlap) {
  console.warn('WARNING: `line(overlap)` is deprecated, use `new LineLayout(overlap)` instead.');
  return new LineLayout(overlap);
}

module.exports = {
  LineLayout,
  TableLayout,
  line,
  table,
};
