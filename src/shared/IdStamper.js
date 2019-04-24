/*
 * IdStamper utility for the WAMS application.
 *
 * Author: Michael van der Kamp
 * Date: July / August 2018
 *
 * I wrote this generator class to make Id generation more controlled.
 * The class has access to a private (local lexical scope) generator
 *  function and Symbol for generators, and exposes a pair of methods for
 *  stamping new Ids onto objects and cloning previously existing Ids onto
 *  objects.
 */

'use strict';

const { defineOwnImmutableEnumerableProperty } = require('./utilities.js');

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

// Mark these fields as intended for internal use.
const symbols = Object.freeze({
  prevId: Symbol('prevId'),
});

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
     * @alias [@@prevId]
     * @memberof module:shared.IdStamper
     */
    this[symbols.prevId] = 0;
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
    this[symbols.prevId] = getUniqueId(this[symbols.prevId]);
    defineOwnImmutableEnumerableProperty(
      obj,
      'id',
      this[symbols.prevId]
    );
  }

  /**
   * Stamps a clone of the given ID onto the given object.
   *
   * @param {Object} obj - An object onto which an ID will be stamped.
   * @param {number} id - The ID to clone onto obj.
   */
  static cloneId(obj, id) {
    if (Number.isSafeInteger(id)) {
      defineOwnImmutableEnumerableProperty(obj, 'id', id);
    }
  }
}

module.exports = IdStamper;

