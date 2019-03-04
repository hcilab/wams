/*
 * WAMS - An API for Multi-Surface Environments
 *
 * Author: Michael van der Kamp
 */

'use strict';

// Local constant data
const SIXTY_FPS = 1000 / 60;

/**
 * The Publisher class controls a 60fps publish loop, announcing changes to the
 * scheduled objects.
 *
 * @memberof module:server
 */
class Publisher {
  constructor() {
    /**
     * Cache of objects to publish.
     *
     * @type {Set}
     */
    this.cache = new Set();

    // Begin operation immediately.
    setInterval(this.publish.bind(this), SIXTY_FPS);
  }

  /**
   * Publish scheduled objects.
   */
  publish() {
    this.cache.forEach(o => o.publish());
    this.cache.clear();
  }

  /**
   * Schedules an update announcement at the next update interval.
   *
   * @param {module:mixins.Publishable} object - Object with updates to publish.
   */
  schedule(object) {
    this.cache.add(object);
  }
}

module.exports = Publisher;

