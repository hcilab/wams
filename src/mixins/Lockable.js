/*
 * WAMS - An API for Multi-Surface Environments
 *
 * Author: Michael van der Kamp
 */

'use strict';

const locked = Symbol.for('locked');
const holder = Symbol.for('holder');

/**
 * The Lockable mixin allows a class to enable itself to be locked and unlocked,
 * with the default being unlocked.
 *
 * @memberof module:mixins
 *
 * @mixin
 */
const Lockable = (superclass) => class Lockable extends superclass {
  /**
   * Whether this Lockable is locked.
   *
   * @name [@@locked]
   * @type {?boolean}
   * @default falsy
   * @memberof module:mixins.Lockable
   */

  /**
   * If the Lockable is locked, stores a reference to the holder of the lock.
   *
   * @name [@@holder]
   * @type {?module:mixins.Locker}
   * @default undefined
   * @memberof module:mixins.Lockable
   */

  /**
   * Checks whether this lockable is locked.
   *
   * @memberof module:mixins.Lockable
   *
   * @return {boolean} True if the item is locked, false otherwise.
   */
  isLocked() {
    return this[locked];
  }

  /**
   * Lock this item.
   *
   * @memberof module:mixins.Lockable
   *
   * @param {module:mixins.Locker} locker - The holder of the lock.
   */
  lock(locker) {
    this[locked] = true;
    this[holder] = locker;
  }

  /**
   * Unlock this item.
   *
   * @memberof module:mixins.Lockable
   */
  unlock() {
    this[locked] = false;
    if (this[holder] && this[holder].lockedItem === this) {
      this[holder].clearLockedItem();
      this[holder] = null;
    }
  }
};

module.exports = Lockable;

