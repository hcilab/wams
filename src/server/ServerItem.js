/*
 * WAMS - An API for Multi-Surface Environments
 *
 * Author: Michael van der Kamp
 *  |-> Date: July/August 2018
 *
 * Original author: Jesse Rolheiser
 * Other revisions and supervision: Scott Bateman
 */

'use strict';

const { mergeMatches, IdStamper, Item } = require('../shared.js');
const Point2D   = require('./Point2D.js');

const STAMPER = new IdStamper();

/**
 * The ServerItem provides operations for the server to locate and move items
 * around.
 *
 * @memberof module:server
 * @extends module:shared.Item
 */
class ServerItem extends Item {
  /**
   * @param {Object} values - User-supplied data detailing the item. Properties
   * on this object that line up with {@link module:shared.Item} members will be
   * stored. Any other properties will be ignored.
   */
  constructor(values = {}) {
    super(mergeMatches(ServerItem.DEFAULTS, values));

    /**
     * Some gestures require continous interaction with an item. During this
     * interaction, no other users should be able to interact with the item, so
     * need a way lock it down. This value enables this capability.
     *
     * @type {boolean}
     */
    this.locked = false;

    // Items need to be uniquely identifiable.
    STAMPER.stampNewId(this);
  }

  /**
   * Checks whether a point with the given x,y coordinates is contained by this
   * item.
   *
   * @param {number} x - x coordinate of the point to check.
   * @param {number} y - y coordinate of the point to check.
   *
   * @return {boolean} True if the (x,y) point is located inside this Item.
   * False otherwise.
   */
  containsPoint(x, y) {
    return this.hitbox && this.hitbox.contains({
      x: x - this.x,
      y: y - this.y,
    });
  }

  /**
   *
   * @param {number} x - x coordinate of the point to check.
   * @param {number} y - y coordinate of the point to check.
   *
   * @return {boolean} True if the (x,y) point is located inside this Item, and
   * this Item is not currently locked. False otherwise.
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
   * @param {number} [ x=this.x ] - x coordinate of the destination.
   * @param {number} [ y=this.y ] - y coordinate of the destination.
   */
  moveTo(x = this.x, y = this.y) {
    this.assign({ x, y });
  }

  /**
   * Move this item by the given amount.
   *
   * @param {number} [ dx=0 ] - Change in x coordinate.
   * @param {number} [ dy=0 ] - Change in y coordinate.
   */
  moveBy(dx = 0, dy = 0) {
    this.moveTo(this.x + dx, this.y + dy);
  }

  /**
   * Rotate the item by the given amount (in radians).
   *
   * @param {number} [radians=0] Amount of rotation to apply, in radians.
   * @param {number} [x=this.x] x coordinate at which to anchor the rotation.
   * @param {number} [y=this.y] y coordinate at which to anchor the rotation.
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
   *
   * @param {number} [scale=1] Amount of scaling to apply.
   * @param {number} [x=this.x] x coordinate at which to anchor the scaling.
   * @param {number} [y=this.y] y coordinate at which to anchor the scaling.
   */
  scaleBy(ds = 1, mx = this.x, my = this.y) {
    const scale = ds * this.scale;
    if (scale > 0.1 && scale < 10) {
      const delta = new Point2D(this.x - mx, this.y - my).times(ds);
      const x = mx + delta.x;
      const y = my + delta.y;
      this.assign({ scale, x, y });
      this.hitbox && this.hitbox.scale(ds);
    }
  }
}

/**
 * The default values for a ServerItem.
 *
 * @type {Object}
 */
ServerItem.DEFAULTS = Object.freeze({
  x:         0,
  y:         0,
  hitbox:    null,
  rotation:  0,
  scale:     1,
  type:      'item/foreground',
  imgsrc:    '',
  blueprint: null,
});

module.exports = ServerItem;

