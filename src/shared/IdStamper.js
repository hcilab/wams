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
 * Generator for integers from 0 to MAX_SAFE_INTEGER.
 *
 * @inner
 * @memberof module:shared.IdStamper
 * @generator
 * @returns {number} Unique integers.
 */
function* id_gen() {
  let next_id = 0;
  while (Number.isSafeInteger(next_id + 1)) yield ++next_id;
}

// Mark the generator reference as not intended for external use.
const gen = Symbol('gen');

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
 * stamper.cloneId(danger, obj.id); // Will work. 'danger' & 'obj' are
 *                                  // now both using the same Id.
 *
 * @memberof module:shared
 */
class IdStamper {
  constructor() {
    /**
     * A generator instance that yields unique integers.
     *
     * @type {Generator}
     * @alias [@@id_gen]
     * @memberof module:shared.IdStamper
     */
    this[gen] = id_gen();
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
    defineOwnImmutableEnumerableProperty(
      obj,
      'id',
      this[gen].next().value
    );
  }

  /**
   * Stamps a clone of the given ID onto the given object.
   *
   * @param {Object} obj - An object onto which an ID will be stamped.
   * @param {number} id - The ID to clone onto obj.
   */
  cloneId(obj, id) {
    if (Number.isSafeInteger(id)) {
      defineOwnImmutableEnumerableProperty(obj, 'id', id);
    }
  }
}

module.exports = IdStamper;

