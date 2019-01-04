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

const { mergeMatches, IdStamper, Item } = require('../shared.js');
const Polygon2D = require('./Polygon2D.js');

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
  /**
   * values: User-supplied data detailing the item.
   */
  constructor(values = {}) {
    super(mergeMatches(DEFAULTS, values));

    /**
     * Some gestures require continous interaction with an item. During this
     * interaction, no other users should be able to interact with the item, so
     * need a way lock it down.
     */
    this.locked = false;

    this.hitbox = new Polygon2D([
      { x: 0,          y: 0 },
      { x: this.width, y: 0 },
      { x: this.width, y: this.height },
      { x: 0,          y: this.height },
    ], { x: this.x, y: this.y });

    // Items need to be uniquely identifiable.
    STAMPER.stampNewId(this);
  }

  /**
   * Returns true if the (x,y) point is located inside this Item. False
   * otherwise.
   *
   * x: x coordinate of the point to check.
   * y: y coordinate of the point to check.
   */
  containsPoint(x, y) {
    return this.hitbox.contains({ x,y });
    // return (this.x <= x) && 
      // (this.y <= y) && 
      // (this.x + this.width  >= x) && 
      // (this.y + this.height >= y);
  }

  /**
   * Returns true if the (x,y) point is located inside this Item, and this Item
   * is not currently locked. False otherwise.
   *
   * x: x coordinate of the point to check.
   * y: y coordinate of the point to check.
   */
  isFreeItemAt(x, y) {
    return !this.locked && this.containsPoint(x, y);
  }

  /**
   * Lock this item.
   */
  lock() {
    this.locked = true;
  }

  /**
   * Unlock this item.
   */
  unlock() {
    this.locked = false;
  }

  /**
   * Move this item to the given coordinates.
   *
   * x: x coordinate of the destination. Defaults to current x coordinate.
   * y: y coordinate of the destination. Defaults to current y coordinate.
   */
  moveTo(x = this.x, y = this.y) {
    this.assign({x,y});
  }

  /**
   * Move this item by the given amount.
   *
   * dx: Change in x coordinate. Defaults to 0.
   * dy: Change in y coordinate. Defaults to 0.
   */
  moveBy(dx = 0, dy = 0) {
    this.moveTo(this.x + dx, this.y + dy);
    this.hitbox.translate(dx, dy);
  }
}

module.exports = ServerItem;

