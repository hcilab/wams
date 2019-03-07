/*
 * WAMS - An API for Multi-Surface Environments
 *
 * Author: Michael van der Kamp
 */

'use strict';

const publisher = Symbol('publisher');

/**
 * This mixin provides a basis for types that can be published by a Publisher,
 * where a Publisher is a class that routinely calls 'publish()' on items that
 * it have been scheduled for publication.
 *
 * @memberof module:mixins
 *
 * @mixin
 */
const Publishable = (superclass) => class Publishable extends superclass {
  /**
   * The publisher associated with this Publishable.
   *
   * @memberof module:mixins.Publishable
   *
   * @type {module:server.Publisher}
   */
  get publisher() { return this[publisher]; }
  set publisher(p) { this[publisher] = p; }

  /**
   * Publish this object.
   *
   * @memberof module:mixins.Publishable
   */
  publish() {
    throw 'Classes using Publishable mixin must implement publish()';
  }

  /**
   * Schedule a publication of this object.
   *
   * @memberof module:mixins.Publishable
   */
  schedulePublication() {
    this[publisher].schedule(this);
  }
};

module.exports = Publishable;


