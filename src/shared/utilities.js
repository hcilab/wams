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

module.exports = Object.freeze({
  defineOwnImmutableEnumerableProperty,
  findLast,
  NOP,
  removeById,
});

