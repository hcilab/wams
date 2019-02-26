/*
 * WAMS - An API for Multi-Surface Environments
 *
 * Author: Michael van der Kamp
 */

'use strict';

const locked = Symbol.for('locked');

/**
 * The Lockable mixin allows a class to enable itself to be locked and unlocked,
 * with the default being unlocked.
 *
 * @memberof module:mixins
 *
 * @mixin
 */
const Lockable = (superclass) => class extends superclass {
  /**
   * Checks whether this item is locked.
   *
   * @instance
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
   * @instance
   * @memberof module:mixins.Lockable
   */
  lock() {
    this[locked] = true;
  }

  /**
   * Unlock this item.
   *
   * @instance
   * @memberof module:mixins.Lockable
   */
  unlock() {
    this[locked] = false;
  }
};

module.exports = Lockable;

