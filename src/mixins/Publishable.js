'use strict';

const symbols = Object.freeze({
  scheduled: Symbol('scheduled'),
  emit: Symbol('emit'),
});

/**
 * This mixin provides a basis for types that can be published. Publish using
 * the `publish()` method.
 *
 * Classes that use this mixin must implement the `emitPublication()` method,
 * which defines how the instance object will emit its publication. While this
 * might seem to negate the whole purpose of using a mixin, what the mixin does
 * is ensure that the publication will not be sent until all transformations
 * relating to an event have been applied.
 *
 * @private
 * @memberof module:mixins
 *
 * @mixin
 */
const Publishable = (superclass) =>
  class Publishable extends superclass {
    /**
     * Whether a publication has been scheduled.
     *
     * @name [@@scheduled]
     * @type {?boolean}
     * @default falsy
     * @memberof module:mixins.Publishable
     */

    /**
     * Schedule a publication of this object for the end of this turn of the
     * node.js event loop. This will have the effect of making sure that the
     * object update is not emitted until after all transformations applied by
     * the user have been completed (assuming they don't use async callbacks, of
     * course), and that only one update will be emitted regardless of the number
     * of transformations that are applied! All this and we don't even need to do
     * any fancy software engineering!
     *
     * @memberof module:mixins.Publishable
     */
    publish() {
      if (!this[symbols.scheduled]) {
        this[symbols.scheduled] = true;
        setImmediate(this[symbols.emit].bind(this));
      }
    }

    /**
     * Emit the publication of this object and mark that it is no longer scheduled
     * for publication.
     *
     * @alias [@@emit]
     * @static
     * @memberof module:mixins.Publishable
     */
    [symbols.emit]() {
      this[symbols.scheduled] = false;
      this._emitPublication();
    }

    /**
     * Emit the publication of this object. This method must be implemented by
     * classes that use this mixin. It should never be called except by this
     * mixin.
     *
     * @protected
     * @memberof module:mixins.Publishable
     */
    _emitPublication() {
      throw Error('Classes using Publishable mixin must implement _emitPublication()');
    }
  };

module.exports = Publishable;
