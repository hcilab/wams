'use strict';

/**
 * Given a previous ID, returns the next unique ID in the sequence.
 *
 * @inner
 * @memberof module:shared.IdStamper
 * @throws Error
 *
 * @param {number} previous - The previously assigned unique ID.
 *
 * @returns {number} The next unique ID
 */
function getUniqueId(previous) {
  const next = previous + 1;
  if (Number.isSafeInteger(next)) {
    return next;
  }
  throw new Error('Ran out of unique IDs!');
}

/**
 * Class for stamping and cloning integer IDs. Stamped IDs are unique on a
 * per-IdStamper basis.
 *
 * @example
 * const stamper = new IdStamper();
 * const obj = {};
 * stamper.stampNewId(obj);
 * console.log(obj.id);  // an integer unique to Ids stamped by stamper
 * obj.id = 2;           // has no effect.
 * delete obj.id;        // false
 *
 * const danger = {};
 * IdStamper.cloneId(danger, obj.id); // Will work. 'danger' & 'obj' are
 *                                    // now both using the same Id.
 *
 * @memberof module:shared
 */
class IdStamper {
  constructor() {
    /**
     * The value of the previously assigned ID.
     *
     * @type {number}
     * @memberof module:shared.IdStamper
     */
    this.previousId = 0;
  }

  /**
   * Stamps an integer ID, unique to this IdStamper, onto the given object.
   *
   * All Ids produced by this method are guaranteed to be unique, on a
   * per-stamper basis. (Two uniquely constructed stampers can and will generate
   * identical Ids).
   *
   * @param {Object} obj - An object onto which an ID will be stamped.
   */
  stampNewId(obj) {
    this.previousId = getUniqueId(this.previousId);
    Object.defineProperty(obj, 'id', {
      value: this.previousId,
      configurable: false,
      enumerable: true,
      writable: false,
    });
  }

  /**
   * Stamps a clone of the given ID onto the given object.
   *
   * @param {Object} obj - An object onto which an ID will be stamped.
   * @param {number} id - The ID to clone onto obj.
   */
  static cloneId(obj, id) {
    if (Number.isSafeInteger(id)) {
      Object.defineProperty(obj, 'id', {
        value: id,
        configurable: false,
        enumerable: true,
        writable: false,
      });
    }
  }
}

module.exports = IdStamper;
