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

const { mergeMatches, IdStamper, View } = require('../shared.js');
const { Lockable, Transformable2D } = require('../mixins.js');

const STAMPER = new IdStamper();

/**
 * The ServerView provides operations for the server to locate, move, and
 * rescale views.
 *
 * @memberof module:server
 * @extends module:shared.View
 * @mixes module:mixins.Transformable2D
 * @mixes module:mixins.Lockable
 */
class ServerView extends Lockable(Transformable2D(View)) {
  /**
   * @param {Object} [ values ] - Object with user supplied values describing
   * the view.
   */
  constructor(values = {}) {
    super(mergeMatches(ServerView.DEFAULTS, values));

    /**
     * If a continuous gesture needs to lock down an item, a reference to that
     * item will be saved here.
     *
     * @type {( module:server.ServerView | module:server.ServerItem )}
     */
    this.lockedItem = null;

    // Views must be uniquely identifiable.
    STAMPER.stampNewId(this);
  }

  /**
   * Get the position of the bottom left corner of this view.
   *
   * @type {module:server.Point2D}
   */
  get bottomLeft() { return this.transformPoint(0, this.height); }

  /**
   * Get the position of the bottom right corner of this view.
   *
   * @type {module:server.Point2D}
   */
  get bottomRight() { return this.transformPoint(this.width, this.height); }

  /**
   * Get the position of the top left corner of this view.
   *
   * @type {module:server.Point2D}
   */
  get topLeft() { return this.transformPoint(0, 0); }

  /**
   * Get the position of the top right corner of this view.
   *
   * @type {module:server.Point2D}
   */
  get topRight() { return this.transformPoint(this.width, 0); }

  /**
   * Obtain a lock on the given item for this view.
   *
   * @param {( module:server.ServerItem | module:server.ServerView )} item - The
   * item to lock down.
   */
  getLockOnItem(item) {
    if (this.lockedItem) this.lockedItem.unlock();
    this.lockedItem = item;
    item.lock();
  }

  /**
   * Release the view's item lock.
   */
  releaseLockedItem() {
    if (this.lockedItem) this.lockedItem.unlock();
    this.lockedItem = null;
  }

  /*
   * Scale the item by the given amount.
   *
   * @override
   */
  scaleBy(ds = 1, mx, my) {
    super.scaleBy(ds, mx, my, 'divideBy');
  }
}

/**
 * The default values for a ServerView.
 *
 * @type {Object}
 */
ServerView.DEFAULTS = Object.freeze({
  x:        0,
  y:        0,
  width:    1600,
  height:   900,
  type:     'view/background',
  scale:    1,
  rotation: 0,
});

Object.assign(ServerView.prototype, Transformable2D);

module.exports = ServerView;

