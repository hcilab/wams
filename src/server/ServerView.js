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
  /*
   * XXX: At some point, the effective width and height should be made to be
   *      updated whenever either the width, height, or scale of the
   *      view get updated. This could be achieve with getters and 
   *      setters on those three values. Might need to think through all the
   *      possible complications though.
   *
   *      The same thing could maybe be done with the 'center' getter, so
   *      that it refers to an actual stored value that gets updated whenever
   *      the effective width or height gets updated, or when the x or y
   *      values get updated. This would prevent having to recompute every
   *      time the value is accessed, which is the way things are working
   *      currently.
   *
   *      Perhaps one technique would be to find a way of storing the actual
   *      x, y, width, height, effectiveWidth, effectiveHeight, and scale
   *      using some private data technique with alternative names for the
   *      variables (or some other storage method) and have the original 
   *      names be used for the getters and setters. Might want to have a
   *      look at the shared Reporter factory definition to see if this can
   *      be handled at a more general level.
   */
  constructor(values = {}) {
    super(mergeMatches(DEFAULTS, values));

    /**
     * x and y dimensions detailing the boundaries within which the view can
     * operate.
     */
    this.bounds = values.bounds || DEFAULTS.bounds;

    /**
     * The effective width of the view inside the model.
     */
    this.effectiveWidth = this.width / this.scale;

    /**
     * The effective height of the view inside the model.
     */
    this.effectiveHeight = this.height / this.scale;

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
  get bottom()  { return this.y + this.effectiveHeight; }
  get left()    { return this.x; }
  get right()   { return this.x + this.effectiveWidth; }
  get top()     { return this.y; }

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
      (this.x + width  <= this.bounds.x) &&
      (this.y + height <= this.bounds.y);
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
    return (x >= 0) && (x + this.effectiveWidth <= this.bounds.x);
  }

  /**
   * Returns true if this view can be moved to the given Y coordinate and still
   * fit within the boundaries of the workspace.
   *
   * y: desired y coordinate to move to
   */
  canMoveToY(y = this.y) {
    return (y >= 0) && (y + this.effectiveHeight <= this.bounds.y);
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
    // const coordinates = { x: this.x, y: this.y };
    // if (this.canMoveToX(x)) coordinates.x = x;
    // if (this.canMoveToY(y)) coordinates.y = y;
    // this.assign(coordinates);
    this.assign({ x, y });
  }

  /**
   * Rotate the view by the given amount, in radians.
   *
   * radians: The amount of rotation to apply to the view.
   */
  rotateBy(radians = 0, px = this.x, py = this.y) {
    const pivot = new Point2D(px, py);
    const origin = new Point2D(this.x, this.y);
    const delta = origin.minus(pivot);
    delta.rotate(-radians);
    this.assign({
      x: pivot.x + delta.x,
      y: pivot.y + delta.y,
      rotation: this.rotation + radians,
    });
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
   *
   * The scaled width and height (stored permanently as effective width and
   * height) are determined by dividing the width or height by the scale.
   * This might seem odd at first, as that seems to be the opposite of what
   * should be done. But what these variables are actually representing is the
   * amount of the underlying workspace that can be displayed inside the
   * view. So a larger scale means that each portion of the workspace takes
   * up more of the view, therefore _less_ of the workspace is visible.
   * Hence, division.
   *
   * XXX: One thing that could be done in this function is to try anchoring
   *      on the right / bottom if anchoring on the left / top produces a
   *      failure. (By anchoring, I mean that the given position remains
   *      constant while the scaling is occurring).
   */
  scaleTo(scale = this.scale) {
    const effectiveWidth = this.width / scale;
    const effectiveHeight = this.height / scale;
    if (this.canBeScaledTo(effectiveWidth, effectiveHeight)) {
      this.assign({ scale, effectiveWidth, effectiveHeight });
      return true;
    }
    return false;
  }
}

module.exports = ServerView;

