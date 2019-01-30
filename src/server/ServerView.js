/*
 * WAMS - An API for Multi-Surface Environments
 *
 * Author: Michael van der Kamp
 *  |-> Date: July/August 2018
 *
 * Original author: Jesse Rolheiser
 * Other revisions and supervision: Scott Bateman
 *
 * The ServerView provides operations for the server to locate, move,
 * and rescale views.
 */

'use strict';

const { mergeMatches, IdStamper, View } = require('../shared.js');
const Point2D = require('./Point2D.js');

const DEFAULTS = {
  x: 0,
  y: 0,
  width: 1600,
  height: 900,
  type: 'view/background',
  scale: 1,
  rotation: 0,
};

const STAMPER = new IdStamper();

class ServerView extends View {
  constructor(values = {}) {
    super(mergeMatches(DEFAULTS, values));

    /**
     * If a continuous gesture needs to lock down an item, a reference to that
     * item will be saved here.
     */
    this.lockedItem = undefined;

    /**
     * Some gestures require continous interaction with an item. During this
     * interaction, no other users should be able to interact with the item, so
     * need a way lock it down.
     */
    this.locked = false;

    // Views must be uniquely identifiable.
    STAMPER.stampNewId(this);
  }

  /**
   * Getters for the sides of the view for positioning elements relative to each
   * other.
   */
  side(x, y) {
    return new Point2D(x, y)
      .rotate(-this.rotation)
      .divideBy(this.scale)
      .plus(this);
  }

  get bottomLeft()  { return this.side(0, this.height); }
  get bottomRight() { return this.side(this.width, this.height); }
  get topLeft()     { return this.side(0, 0); }
  get topRight()    { return this.side(this.width, 0); }
        
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
   * Obtain a lock on the given item for this view.
   *
   * item: The item to lock down.
   */
  getLockOnItem(item) {
    if ( this.lockedItem ) this.lockedItem.unlock();
    this.lockedItem = item;
    item.lock();
  }
      
  /**
   * Move the view by the given amounts.
   *
   * dx: Movement along the x axis.
   * dy: Movement along the y ayis.
   */
  moveBy(dx = 0, dy = 0) {
    this.moveTo(this.x + dx, this.y + dy);
  }

  /**
   * Move the view to the given coordinates (or attempt to, anyway).
   * Views are constrained to stay within the boundaries of the workspace.
   * TODO: Adjust to move to maximal x/y location if unable to move all the way.
   *
   * x: x coordinate to move to
   * y: y coordinate to move to
   */
  moveTo(x = this.x, y = this.y) {
    this.assign({ x, y });
  }

  /**
   * Rotate the view by the given amount, in radians.
   *
   * radians: The amount of rotation to apply to the view.
   * px     : The x coordinate of the point around which to rotate.
   * py     : The y coordinate of the point around which to rotate.
   */
  rotateBy(radians = 0, px = this.x, py = this.y) {
    const delta = new Point2D(this.x - px, this.y - py).rotate(-radians);
    const x = px + delta.x;
    const y = py + delta.y;
    const rotation = this.rotation + radians;
    this.assign({ x, y, rotation });
  }

  /**
   * Release the view's item lock.
   */
  releaseLockedItem() {
    if (this.lockedItem) this.lockedItem.unlock();
    this.lockedItem = undefined;
  }

  /**
   * Adjust scale to the given scale.
   *
   * ds: Change in desired scale.
   */
  scaleBy(ds = 1, mx = this.x, my = this.y) {
    const scale = ds * this.scale;
    if (scale > 0.1 && scale < 10) {
      const delta = new Point2D( this.x - mx, this.y - my ).divideBy(ds)
      const x = mx + delta.x;
      const y = my + delta.y;
      this.assign({ x, y, scale });
    }
  }
}

module.exports = ServerView;

