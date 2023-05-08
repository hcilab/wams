'use strict';

/**
 * @namespace utilities
 * @memberof module:shared
 */

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
  const idx = array.findIndex((o) => o.id === item.id);
  if (idx >= 0) {
    array.splice(idx, 1);
    return true;
  }
  return false;
}

module.exports = Object.freeze({
  NOP,
  removeById,
});
