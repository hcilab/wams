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
const Point2D   = require('./Point2D.js');

const DEFAULTS = Object.freeze({
  x: 0,
  y: 0,
  hitbox: null,
  rotation: 0,
  scale: 1,
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
    return this.hitbox && this.hitbox.contains({ 
      x: x - this.x,
      y: y - this.y,
    });
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
    this.assign({ x, y });
  }

  /**
   * Move this item by the given amount.
   *
   * dx: Change in x coordinate. Defaults to 0.
   * dy: Change in y coordinate. Defaults to 0.
   */
  moveBy(dx = 0, dy = 0) {
    this.moveTo(this.x + dx, this.y + dy);
  }

  /**
   * Rotate the item by the given amount (in radians).
   */
  rotateBy(radians = 0, px = this.x, py = this.y) {
    const delta = new Point2D(this.x - px, this.y - py).rotate(radians);
    const x = px + delta.x;
    const y = py + delta.y;
    const rotation = this.rotation - radians;
    this.assign({ x, y, rotation });
    this.hitbox && this.hitbox.rotate(radians);
  }

  /**
   * Scale the item by the given amount.
   */
  scaleBy(ds = 1, mx = this.x, my = this.y) {
    const scale = ds * this.scale;
    if (scale > 0.1 && scale < 10) {
      const delta = new Point2D( this.x - mx, this.y - my ).times(ds)
      const x = mx + delta.x;
      const y = my + delta.y;
      this.assign({ scale, x, y });
      this.hitbox && this.hitbox.scale(ds);
    }
  }
}

module.exports = ServerItem;

