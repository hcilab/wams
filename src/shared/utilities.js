/*
 * Defines a set of general utilities for use across the project.
 *
 * Author: Michael van der Kamp
 * Date: July / August 2018
 */

'use strict';

/**
 * @namespace utilities
 * @memberof module:shared
 */

/**
 * Defines the given property on the given object with the given value, and sets
 * the property to unconfigurable, unwritable, but enumerable.
 *
 * @param {object} obj - The object on which the property will be defined.
 * @param {string} prop - The property to define on obj.
 * @param {any} val - The value to assign to the property.
 *
 * @memberof module:shared.utilities
 */
function defineOwnImmutableEnumerableProperty(obj, prop, val) {
  Object.defineProperty(obj, prop, {
    value:        val,
    configurable: false,
    enumerable:   true,
    writable:     false,
  });
}

/**
 * Find the last value in an Array for which the supplied callback function
 *  returns true. Operates on each index in the Array, starting at 'fromIndex'
 *  and going backwards to the start of the Array or until the desired value
 *  is found.
 *
 * Returns the value that passed the callback, if found, or null.
 *
 * Callback function should be of similar form to the Array.findIndex()
 *  standard library function.
 *
 * @memberof module:shared.utilities
 *
 * @param {mixed[]} array - The array to search.
 * @param {function} callback - The condition function used for the search.
 * @param {number} [ fromIndex=(array.length-1) ] - Index to begin search, goes
 * backward from here.
 * @param {Object} [ thisArg ] - 'this' context for the callback function.
 *
 * @return {?mixed} The last item in the array for which the callback returned
 * true, or null if the callback never returned true;
 */
function findLast(array, callback, fromIndex = array.length - 1, thisArg) {
  while (fromIndex >= 0 &&
    !callback.call(thisArg, array[fromIndex], fromIndex, array)) {
    --fromIndex;
  }
  return fromIndex >= 0 ? array[fromIndex] : null;
}

/**
 * Create a new object, with all the own properties of 'defaults' having values
 * from 'data', if found, otherwise with values from 'defaults'.
 *
 * @memberof module:shared.utilities
 *
 * @param {Object} defaults - Object with default properties and values. If data
 * is not provided or all the property names of data are disjoint with the
 * property names of defaults, then defaults will be returned.
 * @param {} data - Object with values to use for corresponding properties in
 * defaults. Properties not found in defaults will be ignored.
 *
 * @returns {Object} The new object.
 */
function mergeMatches(defaults = {}, data = {}) {
  const rv = {};
  Object.keys(defaults).forEach(k => {
    rv[k] = k in data ? data[k] : defaults[k];
  });
  return rv;
}

/**
 * This method will set an already-existing property on an object to be
 *  immutable. In other words, it will configure it as such:
 *
 *    configurable: false
 *    writable: false
 *
 * It will have no effect on non-configurable properties, and will turn an
 *  accessor descriptor  a data descriptor. (I.e. if the property is
 *  defined with getters and setters, they will be lost).
 *
 * It will have no effect on properties that do not exist directly on the
 *  Object (properties further up the prototype chain are not affected).
 *
 * It will affect both enumerable and non-enumerable properties.
 *
 * This method is intended for use when the only reason for a call to
 *  Object.defineProperty() was to make the property immutable.
 *
 * @memberof module:shared.utilities
 *
 * @param {Object} obj - The object to modify.
 * @param {string} prop - The name of the property of obj to make immutable.
 *
 * @returns {Object} The modified object.
 */
function makeOwnPropertyImmutable(obj, prop) {
  const desc = Object.getOwnPropertyDescriptor(obj, prop);
  if (desc && desc.configurable) {
    Object.defineProperty(obj, prop, {
      configurable: false,
      writable:     false,
    });
  }
  return obj;
}

/**
 * Plain, simple NOP definition. If there's a faster NOP, redefine it here.
 *
 * @memberof module:shared.utilities
 */
const NOP = () => {};

/**
 * Removes the given item from the given array, according to its Id.
 *
 * @memberof module:shared.utilities
 *
 * @param {Object[]} array - The array to modify.
 * @param {Object} item  - The item to remove from array according to its Id.
 *
 * @return {boolean} True if the item was found and removed, false otherwise.
 */
function removeById(array, item) {
  const idx = array.findIndex(o => o.id === item.id);
  if (idx >= 0) {
    array.splice(idx, 1);
    return true;
  }
  return false;
}

/**
 * Removes the given item of the given class (enforced by throwing an
 * exception if not an instance) from the given array.
 *
 * @memberof module:shared.utilities
 * @throws {string}
 *
 * @param {Object[]} array - The array to modify.
 * @param {Object} item - The item to remove from array according to its Id, if
 * it is an instance of class_fn
 * @param {Class} class_fn - Insist that item be an instance of this class
 * function.
 *
 * @return {boolean} True if the item was found and removed, false otherwise.
 */
function safeRemoveById(array, item, class_fn) {
  if (!(item instanceof class_fn)) throw `Invalid ${class_fn} received.`;
  return removeById(array, item);
}

module.exports = Object.freeze({
  defineOwnImmutableEnumerableProperty,
  findLast,
  mergeMatches,
  makeOwnPropertyImmutable,
  NOP,
  removeById,
  safeRemoveById,
});

