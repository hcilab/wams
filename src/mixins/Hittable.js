'use strict';

const { Point2D } = require('../shared.js');
const Interactable = require('./Interactable.js');

/**
 * The Hitbox interface is used by the Hittable mixin. If a Hitbox is attached
 * to a Hittable instance object, hit detection will be performed on the object
 * when the user's first input in an interaction sequence touches down.
 *
 * Note that a class implementing the Hitbox interface should not worry about
 * applying transformations to the points it receives. That will be taken care
 * of by the Hittable mixin. To produce accurate results, a Hitbox should behave
 * as if the object it is associated with is positioned at x = 0, y = 0, with
 * scale = 1 and rotation = 0. That is, with the identity transformation.
 *
 * @interface Hitbox
 * @memberof module:shared
 */

/**
 * Report whether the given (x,y) point is contained within the shape.
 *
 * @function
 * @name module:shared.Hitbox#contains
 * @param {module:shared.Point2D} point - The point to test.
 * @return {boolean} True if the given point is inside the shape, false
 * otherwise.
 */

/**
 * This mixin extends the Interactable mixin by allow hit detection. A Hittable
 * will not automatically be able to respond to hit detection. To make a
 * Hittable item responsive, add a 'hitbox' property to the class or
 * instantiated object, which is itself an instance of a class which implements
 * the 'Hitbox' interface.
 *
 * The purpose of the Hittable mixin is simply to provide functionality for
 * interacting with the 'hitbox' property.
 *
 * @memberof module:mixins
 *
 * @mixin
 * @mixes module:mixins.Interactable
 */
const Hittable = (sclass) =>
  class Hittable extends Interactable(sclass) {
    /**
     * The hitbox for this Hittable instance. If it is null, hit detection will
     * always return a falsy value.
     *
     * @name hitbox
     * @type {?module:shared.Hitbox}
     * @default undefined
     * @memberof module:mixins.Hittable
     */

    /**
     * Checks whether a point with the given x,y coordinates is contained by
     * this item.
     *
     * @memberof module:mixins.Hittable
     *
     * @param {number} px - x coordinate of the point to check.
     * @param {number} py - y coordinate of the point to check.
     *
     * @return {boolean} True if the (x,y) point is located inside this Item.
     * False otherwise.
     */
    containsPoint(px, py) {
      const point = new Point2D(px, py).minus(this).divideBy(this.scale).rotate(this.rotation);
      return this.hitbox && this.hitbox.contains(point);
    }
  };

module.exports = Hittable;
