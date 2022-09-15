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
const Locker = (superclass) =>
  class Locker extends superclass {
    /**
     * The internally stored reference to the locked item. For access use the
     * external getter. There is no external setter provided. The nature of
     * Symbols makes this interal reference technically accessible, but it still
     * should not be set directly.
     *
     * @name [@@lockedItem]
     * @type {?module:mixins.Lockable}
     * @default undefined
     * @memberof module:mixins.Locker
     */

    /**
     * External getter for the locked item. There is no setter available.
     *
     * @memberof module:mixins.Locker
     *
     * @type {module:mixins.Lockable}
     */
    get lockedItem() {
      return this[lockedItem];
    }

    /**
     * Clear the locked item. Shortcuts the releaseLockedItem() approach and just
     * sets the locked item to null. Use with caution!
     *
     * Made available originally purely for use by the Lockable interface.
     *
     * @memberof module:mixins.Locker
     */
    clearLockedItem() {
      this[lockedItem] = null;
    }

    /**
     * Obtain a lock on the given item for this view.
     *
     * @memberof module:mixins.Locker
     *
     * @param {module:mixins.Lockable} item - The item to lock down.
     */
    obtainLockOnItem(item) {
      if (!item.isLocked()) {
        if (this[lockedItem]) this[lockedItem].unlock();
        this[lockedItem] = item;
        item.lock(this);
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
