/*
 * WAMS - An API for Multi-Surface Environments
 *
 * Author: Michael van der Kamp
 */

'use strict';

const { Point2D } = require('../shared.js');

/**
 * This mixin provides 2D transformation operations for classes with 'x', 'y',
 * 'scale' and 'rotation' properties.
 *
 * @memberof module:mixins
 *
 * @mixin
 */
const Transformable2D = (sclass) =>
  class Transformable2D extends sclass {
    /**
     * Move the transformable by the given amounts.
     *
     * @memberof module:mixins.Transformable2D
     *
     * @param {number} [ dx=0 ] - Movement along the x axis.
     * @param {number} [ dy=0 ] - Movement along the y ayis.
     */
    moveBy(dx = 0, dy = 0) {
      this.x += dx;
      this.y += dy;
    }

    /**
     * Move the transformable to the given coordinates.
     *
     * @memberof module:mixins.Transformable2D
     *
     * @param {number} [ x=this.x ] - x coordinate to move to.
     * @param {number} [ y=this.y ] - y coordinate to move to.
     */
    moveTo(x = this.x, y = this.y) {
      this.x = x;
      this.y = y;
    }

    /**
     * Rotate the transformable by the given amount, in radians, around the given
     * x,y point.
     *
     * @memberof module:mixins.Transformable2D
     *
     * @param {number} [ radians=0 ] - The amount of rotation to apply to the
     * transformable, in radians.
     * @param {number} [ px=this.x ] - The x coordinate of the point around which
     * to rotate.
     * @param {number} [ py=this.y ] - The y coordinate of the point around which
     * to rotate.
     */
    rotateBy(radians = 0, px = this.x, py = this.y) {
      const delta = new Point2D(this.x - px, this.y - py).rotate(radians);
      this.x = px + delta.x;
      this.y = py + delta.y;
      this.rotation = this.rotation - radians;
    }

    /**
     * Adjust the transformable by the given scale.
     *
     * @memberof module:mixins.Transformable2D
     *
     * @param {number} [ ds=1 ] - Change in desired scale.
     * @param {number} [ mx=this.x ] - The x coordinate of the point around which
     * to scale.
     * @param {number} [ my=this.y ] - The y coordinate of the point around which
     * to scale.
     * @param {string} [ deltaFn='times' ] - The Point2D operation to apply to
     * the delta point to extract the corrext this.x and this.y values. Should be
     * one of 'times' or 'divideBy' depending on the use case.
     */
    scaleBy(ds = 1, mx = this.x, my = this.y, deltaFn = 'multiplyBy') {
      const delta = new Point2D(this.x - mx, this.y - my)[deltaFn](ds);
      this.x = mx + delta.x;
      this.y = my + delta.y;
      this.scale = ds * this.scale;
    }

    /**
     * Transforms a point from the transformable space to the default space. That
     * is, it applies to the point the same transformations that apply to this
     * Transformable2D, but in reverse.
     *
     * @memberof module:mixins.Transformable2D
     *
     * @param {number} x - x coordinate to transform.
     * @param {number} y - y coordinate to transform.
     *
     * @return {module:shared.Point2D} The transformed point.
     */
    transformPoint(x, y) {
      return new Point2D(x, y).rotate(-this.rotation).divideBy(this.scale).add(this);
    }

    /**
     * Transforms a "change" point from the transformable space to the default
     * space. Very much like the 'transformPoint' function, except that it does
     * not apply translation.
     *
     * @memberof module:mixins.Transformable2D
     *
     * @param {number} dx - dx coordinate to transform.
     * @param {number} dy - dy coordinate to transform.
     *
     * @return {module:shared.Point2D} The transformed point.
     */
    transformPointChange(dx, dy) {
      return new Point2D(dx, dy).rotate(-this.rotation).divideBy(this.scale);
    }
  };

module.exports = Transformable2D;
