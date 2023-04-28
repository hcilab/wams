'use strict';

const Lockable = require('./Lockable.js');
const Publishable = require('./Publishable.js');
const Transformable2D = require('./Transformable2D.js');

/**
 * This mixin combines the Transformable2D, Lockable, and Publishable mixins to
 * produce an object that can be interacted with by a WAMS application.
 *
 * @memberof module:mixins
 *
 * @mixin
 * @mixes module:mixins.Lockable
 * @mixes module:mixins.Publishable
 * @mixes module:mixins.Transformable2D
 */
const Interactable = (superclass) => {
  return class Interactable extends Publishable(Lockable(Transformable2D(superclass))) {
    /*
     * Move the transformable by the given amounts.
     *
     * @override
     */
    moveBy(dx, dy) {
      super.moveBy(dx, dy);
      this.publish();
    }

    /*
     * Move the transformable to the given coordinates.
     *
     * @override
     */
    moveTo(x, y) {
      super.moveTo(x, y);
      this.publish();
    }

    /*
     * Rotate the transformable by the given amount, in radians, around the
     * given x,y point.
     *
     * @override
     */
    rotateBy(radians, px, py) {
      super.rotateBy(radians, px, py);
      this.publish();
    }

    /*
     * Adjust the transformable by the given scale.
     *
     * @override
     */
    scaleBy(ds, mx, my, deltaFn) {
      super.scaleBy(ds, mx, my, deltaFn);
      this.publish();
    }
  };
};

module.exports = Interactable;
