/*
 * WAMS - An API for Multi-Surface Environments
 *
 * Author: Michael van der Kamp
 */

'use strict';

/**
 * The Locker mixin allows a class to obtain and release a lock on an item.
 *
 * @memberof module:mixins
 *
 * @mixin
 */
const Locker = (superclass) => class extends superclass {
  /**
   * Obtain a lock on the given item for this view.
   *
   * @param {( module:server.ServerItem | module:server.ServerView )} item - The
   * item to lock down.
   */
  getLockOnItem(item) {
    if (!item.isLocked()) {
      if (this.lockedItem) this.lockedItem.unlock();
      this.lockedItem = item;
      item.lock();
    }
  }

  /**
   * Release the view's item lock.
   */
  releaseLockedItem() {
    if (this.lockedItem) this.lockedItem.unlock();
    this.lockedItem = null;
  }
};

module.exports = Locker;

