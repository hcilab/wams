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
  NOP,
  removeById,
});

