/*
 * WAMS - An API for Multi-Surface Environments
 *
 * Author: Michael van der Kamp
 *  |-> Date: July/August 2018
 *
 * Original author: Jesse Rolheiser
 * Other revisions and supervision: Scott Bateman
 */

'use strict';

const { mergeMatches, NOP } = require('../shared.js');
const Gestures = require('../gestures.js');

/**
 * The GestureController is in charge of processing server-side gestures for the
 * purpose of enabling multi-device gestures.
 *
 * @memberof module:server
 */
class GestureController {
  /**
   * @param {Object} handlers - Object with keys as the names gestures and
   *    values as the corresponding function for handling that gesture when it
   *    is recognized.
   * @param {Function} [handlers.pan=NOP]
   * @param {Function} [handlers.rotate=NOP]
   * @param {Function} [handlers.swipe=NOP]
   * @param {Function} [handlers.tap=NOP]
   * @param {Function} [handlers.zoom=NOP]
   * @param {Function} [handlers.track=NOP]
   */
  constructor(handlers = {}) {
    /**
     * Object holding the handlers, so they can be dynamically referenced by
     * name.
     *
     * @type {Object}
     * @property {Function} pan=NOP
     * @property {Function} rotate=NOP
     * @property {Function} swipe=NOP
     * @property {Function} top=NOP
     * @property {Function} zoom=NOP
     * @property {Function} track=NOP
     */
    this.handlers = mergeMatches(GestureController.DEFAULT_HANDLERS, handlers);

    /**
     * The "region" which takes care of gesture processing.
     *
     * @type {module:server.Gestures.Region}
     */
    this.region = new Gestures.Region();

    this.begin();
  }

  /**
   * The Gestures component uses Gesture objects, and expects those objects to
   * be bound to a handler for responding to that gesture. This method takes
   * care of those activities.
   */
  begin() {
    const pan     = new Gestures.Pan({ muteKey: 'ctrlKey' });
    const rotate  = new Gestures.Rotate();
    const pinch   = new Gestures.Pinch();
    const swipe   = new Gestures.Swipe();
    const swivel  = new Gestures.Swivel({ enableKey: 'ctrlKey' });
    const tap     = new Gestures.Tap();
    const track   = new Gestures.Track(['start', 'end']);

    this.region.addGesture(pan,    this.handle('pan'));
    this.region.addGesture(tap,    this.handle('tap'));
    this.region.addGesture(pinch,  this.handle('zoom'));
    this.region.addGesture(rotate, this.handle('rotate'));
    this.region.addGesture(swipe,  this.handle('swipe'));
    this.region.addGesture(swivel, this.handle('rotate'));
    this.region.addGesture(track,  this.handle('track'));
  }

  /**
   * Generates a function that handles the appropriate gesture and data.
   *
   * @param {string} gesture - name of a gesture to handle.
   *
   * @return {Function} Handler for westures that receives a data object and
   * handles it according to the given gesture name.
   */
  handle(gesture) {
    function do_handle(data) {
      this.handlers[gesture](data);
    }
    return do_handle.bind(this);
  }

  /**
   * Processes a PointerEvent that has been forwarded from a client.
   *
   * @param {PointerEvent} event - The event from the client.
   */
  process(event) {
    this.region.arbitrate(event);
  }
}

/**
 * The default handlers for the GestureController.
 *
 * @type {object}
 */
Gestures.DEFAULT_HANDLERS = Object.freeze({
  pan:    NOP,
  rotate: NOP,
  swipe:  NOP,
  tap:    NOP,
  zoom:   NOP,
  track:  NOP,
});

module.exports = GestureController;

