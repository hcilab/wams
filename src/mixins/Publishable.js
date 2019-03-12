/*
 * WAMS - An API for Multi-Surface Environments
 *
 * Author: Michael van der Kamp
 */

'use strict';

/**
 * This mixin provides a basis for types that can be published. In fact it is
 * little more than an interface, as it does not actually implement the
 * 'publish' method, as this is dependent on the specific nature of the
 * Publishable.
 *
 * @memberof module:mixins
 *
 * @mixin
 */
const Publishable = (superclass) => class Publishable extends superclass {
  /**
   * Publish this object.
   *
   * @memberof module:mixins.Publishable
   */
  publish() {
    throw 'Classes using Publishable mixin must implement publish()';
  }
};

module.exports = Publishable;


