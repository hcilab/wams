/*
 * WAMS - An API for Multi-Surface Environments
 *
 * Author: Michael van der Kamp
 */

'use strict';

const Interactable = require('./Interactable.js');

/**
 * This mixin extends the Interactable mixin by allow hit detection.
 *
 * @memberof module:mixins
 *
 * @mixin
 * @mixes module:mixins.Interactable
 */
const Hittable = (superclass) => class extends Interactable(superclass) {
  /**
   * Checks whether a point with the given x,y coordinates is contained by this
   * item.
   *
   * @param {number} px - x coordinate of the point to check.
   * @param {number} py - y coordinate of the point to check.
   *
   * @return {boolean} True if the (x,y) point is located inside this Item.
   * False otherwise.
   */
  containsPoint(px, py) {
    const x = px - this.x;
    const y = py - this.y;
    return this.hitbox && this.hitbox.contains({ x, y });
  }

  /*
   * Rotate the transformable by the given amount, in radians, around the
   * given x,y point.
   *
   * @override
   */
  rotateBy(radians, px, py) {
    super.rotateBy(radians, px, py);
    this.hitbox && this.hitbox.rotate(radians);
  }

  /*
   * Adjust the transformable by the given scale.
   *
   * @override
   */
  scaleBy(ds, mx, my, delta_fn) {
    super.scaleBy(ds, mx, my, delta_fn);
    this.hitbox && this.hitbox.scale(ds);
  }
};

module.exports = Hittable;

