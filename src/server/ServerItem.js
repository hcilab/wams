/*
 * WAMS - An API for Multi-Surface Environments
 *
 * Author: Michael van der Kamp
 *  |-> Date: July/August 2018
 *
 * Original author: Jesse Rolheiser
 * Other revisions and supervision: Scott Bateman
 *
 * The ServerItem provides operations for the server to locate and move items
 * around.
 */

'use strict';

const { getInitialValues, IdStamper, Item } = require('../shared.js');

const DEFAULTS = Object.freeze({
  x: 0,
  y: 0,
  width: 128,
  height: 128,
  type: 'item/foreground',
  imgsrc: '',
  blueprint: null,
});

const STAMPER = new IdStamper();

class ServerItem extends Item {
  constructor(values = {}) {
    super(getInitialValues(DEFAULTS, values));
    STAMPER.stampNewId(this);
  }

  containsPoint(x,y) {
    return (this.x <= x) && 
      (this.y <= y) && 
      (this.x + this.width  >= x) && 
      (this.y + this.height >= y);
  }

  /*
   * Items are allowed to be moved off screen, so no limitations on where
   * items can be moved to.
   */
  moveTo(x = this.x, y = this.y) {
    this.assign({x,y});
  }

  moveBy(dx = 0, dy = 0) {
    this.moveTo(this.x + dx, this.y + dy);
  }
}

module.exports = ServerItem;

