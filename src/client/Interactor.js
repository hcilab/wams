/*
 * WAMS code to be executed in the client browser.
 *
 * Author: Michael van der Kamp
 *  |-> Date: July/August 2018
 *
 * Original author: Jesse Rolheiser
 * Other revisions and supervision: Scott Bateman
 */

'use strict';

// const Westures = require('../../../westures');
const Westures = require('westures');

const { NOP } = require('../shared.js');
const Transform = require('./Transform.js');

/**
 * The Interactor class provides a layer of abstraction between the
 * ClientController and the code that processes user inputs.  Data from
 * recognized gestures is reported directly through to the handlers. The
 * handlers are initialized to NOPs so that the functions which call the
 * handlers don't need to check whether the handler exists.
 *
 * Currently, the Interactor makes use of the Westures library.
 *
 * @memberof module:client
 *
 * @see {@link https://mvanderkamp.github.io/westures-core/}
 */
class Interactor {
  /**
   * @param {Object} handlers - Object with keys as the names gestures and
   *    values as the corresponding function for handling that gesture when it
   *    is recognized.
   * @param {Function} [handlers.swipe=NOP]
   * @param {Function} [handlers.tap=NOP]
   * @param {Function} [handlers.track=NOP]
   * @param {Function} [handlers.transform=NOP]
   */
  constructor(handlers = {}) {
    /**
     * Object holding the handlers, so they can be dynamically referenced by
     * name.
     *
     * @type {Object}
     * @property {Function} [swipe=NOP]
     * @property {Function} [top=NOP]
     * @property {Function} [track=NOP]
     * @property {Function} [transform=NOP]
     */
    this.handlers = { ...Interactor.DEFAULT_HANDLERS, ...handlers };

    // Begin listening activities immediately.
    this.bindRegions();
    window.addEventListener('wheel', this.wheel.bind(this), false);
  }

  /**
   * Westures uses Gesture objects, and expects those objects to be bound to an
   * element, along with a handler for responding to that gesture. This method
   * takes care of those activities.
   */
  bindRegions() {
    const swipe     = new Westures.Swipe();
    const swivel    = new Westures.Swivel({ enableKey: 'ctrlKey' });
    const tap       = new Westures.Tap();
    const track     = new Westures.Track(['start', 'end']);
    const transform = new Transform();

    const region = new Westures.Region(document.body);
    region.addGesture(document.body, tap,       this.forward('tap'));
    region.addGesture(document.body, swipe,     this.forward('swipe'));
    region.addGesture(document.body, swivel,    this.swivel());
    region.addGesture(document.body, transform, this.forward('transform'));
    region.addGesture(document.body, track,     this.forward('track'));
  }

  /**
   * Send a swivel event through as a transformation.
   */
  swivel() {
    function do_swivel({ rotation, pivot }) {
      this.handlers.transform({
        centroid: pivot,
        delta:    { rotation },
      });
    }
    return do_swivel.bind(this);
  }

  /**
   * Generates a function that forwards the appropriate gesture and data.
   *
   * @param {string} gesture - name of a gesture to forward.
   *
   * @return {Function} Handler for westures that receives a data object and
   * forwards it according to the given gesture name.
   */
  forward(gesture) {
    function do_forward(data) {
      this.handlers[gesture](data);
    }
    return do_forward.bind(this);
  }

  /**
   * Treat scrollwheel events as zoom events.
   *
   * @param {WheelEvent} event - The wheel event from the window.
   */
  wheel(event) {
    event.preventDefault();
    const factor = event.ctrlKey ? 0.02 : 0.10;
    const scale = -(Math.sign(event.deltaY) * factor) + 1;
    const centroid = { x: event.clientX, y: event.clientY };
    this.handlers.transform({ centroid, delta: { scale } });
  }
}

/**
 * The default handlers used by the Interactor.
 *
 * @type {object}
 */
Interactor.DEFAULT_HANDLERS = Object.freeze({
  swipe:     NOP,
  tap:       NOP,
  track:     NOP,
  transform: NOP,
});

module.exports = Interactor;

