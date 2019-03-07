/*
 * WAMS - An API for Multi-Surface Environments
 *
 * Author: Michael van der Kamp
 */

'use strict';

const lockedItem = Symbol('lockedItem');

/**
 * The Locker mixin allows a class to obtain and release a lock on an item.
 *
 * @memberof module:mixins
 *
 * @mixin
 */
const Locker = (superclass) => class Locker extends superclass {
  /**
   * The locked item.
   *
   * @memberof module:mixins.Locker
   *
   * @type {module:mixins.Lockable}
   */
  get lockedItem() { return this[lockedItem]; }

  /**
   * Obtain a lock on the given item for this view.
   *
   * @memberof module:mixins.Locker
   *
   * @param {( module:server.ServerItem | module:server.ServerView )} item - The
   * item to lock down.
   */
  obtainLockOnItem(item) {
    if (!item.isLocked()) {
      if (this[lockedItem]) this[lockedItem].unlock();
      this[lockedItem] = item;
      item.lock();
    }
  }

  /**
   * Release the view's item lock.
   *
   * @memberof module:mixins.Locker
   */
  releaseLockedItem() {
    if (this[lockedItem]) this[lockedItem].unlock();
    this[lockedItem] = null;
  }
};

module.exports = Locker;

