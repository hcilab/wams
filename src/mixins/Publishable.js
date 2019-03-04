/*
 * WAMS - An API for Multi-Surface Environments
 *
 * Author: Michael van der Kamp
 */

'use strict';

const publisher = Symbol('publisher');

/**
 * This mixin provides a basis for types that can be published by a Publisher.
 *
 * @memberof module:mixins
 *
 * @mixin
 */
const Publishable = (superclass) => class extends superclass {
  constructor(values = {}) {
    super(values);

    /**
     * Keep track of our publisher.
     *
     * @type {module:server.Publisher}
     */
    this[publisher] = values.publisher;
  }

  /**
   * Publish this object.
   */
  publish() {
    throw 'Classes using Publishable mixin must implement publish()';
  }

  /**
   * Schedule a publication of this object.
   */
  schedulePublication() {
    this[publisher].schedule(this);
  }
};

module.exports = Publishable;


