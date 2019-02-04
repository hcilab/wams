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
 *
 * stampNewId(object):
 *  object:   The object to stamp with an id.
 *
 *  All Ids produced by this method are guaranteed to be unique, on a
 *  per-stamper basis. (Two uniquely constructed stampers can and will
 *  generate identical Ids).
 *
 * cloneId(object, id):
 *  object:   Will receive a cloned id.
 *  id:       The id to clone onto the object.
 *
 * For example:
 *    const stamper = new IdStamper();
 *    const obj = {};
 *    stamper.stampNewId(obj);
 *    console.log(obj.id);  // an integer unique to Ids stamped by stamper
 *    obj.id = 2;           // has no effect.
 *    delete obj.id;        // false
 *
 *    const danger = {};
 *    stamper.cloneId(danger, obj.id); // Will work. 'danger' & 'obj' are
 *                                     // now both using the same Id.
 */

'use strict';

const { defineOwnImmutableEnumerableProperty } = require('./util.js');

/**
 * Generator for integers from 0 to MAX_SAFE_INTEGER.
 */
function* id_gen() {
  let next_id = 0;
  while (Number.isSafeInteger(next_id + 1)) yield ++next_id;
}

/**
 * Mark the class instance's generator as not intended for external use.
 */
const gen = Symbol('gen');

/**
 * Class for stamping and cloning integer IDs. Stamped IDs are unique on a
 * per-IdStamper basis.
 *
 * @memberof module:shared
 */
class IdStamper {
  constructor() {
    this[gen] = id_gen();
  }

  /**
   * Stamps an integer ID, unique to this IdStamper, onto the given object.
   *
   * obj: An object onto which an ID will be stamped.
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
   * obj: An object onto which an ID will be stamped.
   * id : The ID to clone onto obj.
   */
  cloneId(obj, id) {
    if (Number.isSafeInteger(id)) {
      defineOwnImmutableEnumerableProperty(obj, 'id', id);
    }
  }
}

module.exports = IdStamper;

