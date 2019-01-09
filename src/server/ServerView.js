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
  bounds: {
    x: 10000,
    y: 10000,
  },
};

const STAMPER = new IdStamper();

class ServerView extends View {
  constructor(values = {}) {
    super(mergeMatches(DEFAULTS, values));

    /**
     * Bounding box descriptor of the view.
     * TODO: Implement and use this for bounds checking!
     */
    this.boundingBox = new Point2D();
    
    /**
     * x and y dimensions detailing the boundaries within which the view can
     * operate.
     */
    this.workspaceBounds = values.bounds || DEFAULTS.bounds;

    /**
     * If a continuous gesture needs to lock down an item, a reference to that
     * item will be saved here.
     */
    this.lockedItem = null;

    // Views must be uniquely identifiable.
    STAMPER.stampNewId(this);
  }

  /**
   * Getters for the sides of the view for positioning elements relative to each
   * other.
   */
  // get bottom()  { return this.y + this.effectiveHeight; }
  // get left()    { return this.x; }
  // get right()   { return this.x + this.effectiveWidth; }
  // get top()     { return this.y; }

  /**
   * Overrides the default Reporter assign() method, wrapping it in
   * functionality for regulating the effective width and height.
   */
  assign(data) {
    super.assign(data);
  }

  /**
   * Returns true if the view can be scaled to the given dimensions and still
   * fit in the boundaries of the workspace.
   *
   * width : Width of the desired new scale.
   * height: Height of the desired new scale.
   */
  canBeScaledTo(width = this.width, height = this.height) {
    return  (width  > 0) &&
      (height > 0) &&
      (this.x + width  <= this.workspaceBounds.x) &&
      (this.y + height <= this.workspaceBounds.y);
  }

  /*
   * The canMoveTo[XY] functions are split up in order to allow for the x and
   * y dimensions to be independently moved. In other words, if a move fails
   * in the x direction, it can still succeed in the y direction. This makes
   * it easier to push the view into the boundaries.
   *
   * XXX: Can they be unified simply while still allowing this kind of 
   *      separation?
   */

  /**
   * Returns true if this view can be moved to the given X coordinate and still
   * fit within the boundaries of the workspace.
   *
   * x: desired x coordinate to move to
   */
  canMoveToX(x = this.x) {
    return (x >= 0) && (x <= this.workspaceBounds.x);
  }

  /**
   * Returns true if this view can be moved to the given Y coordinate and still
   * fit within the boundaries of the workspace.
   *
   * y: desired y coordinate to move to
   */
  canMoveToY(y = this.y) {
    return (y >= 0) && (y <= this.workspaceBounds.y);
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
    this.lockedItem = null;
  }

  /**
   * Adjust scale to the given scale.
   *
   * scale: Desired scale.
   */
  scaleBy(scale = 1, mx = this.x, my = this.y) {
    scale *= this.scale;
    if (scale > 0.1 && scale < 10) {
      const delta = new Point2D( this.x - mx, this.y - my )
        .times(this.scale)
        .divideBy(scale)
      const x = mx + delta.x;
      const y = my + delta.y;
      this.assign({ x, y, scale });
      return true;
    }
    return false;
  }
}

module.exports = ServerView;

