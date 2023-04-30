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
 * @see {@link https://mvanderkamp.github.io/westures/}
 *
 * @param {Object} handlers - Object with keys as the names gestures and values
 *    as the corresponding function for handling that gesture when it is
 *    recognized.
 * @param {Function} [handlers.swipe=NOP]
 * @param {Function} [handlers.tap=NOP]
 * @param {Function} [handlers.track=NOP]
 * @param {Function} [handlers.transform=NOP]
 */
class Interactor {
  constructor(root, handlers = {}) {
    /**
     * Object holding the handlers, so they can be dynamically referenced by
     * name.
     *
     * @type {Object}
     * @property {Function} [swipe=NOP]
     * @property {Function} [tap=NOP]
     * @property {Function} [track=NOP]
     * @property {Function} [transform=NOP]
     */
    this.handlers = { ...Interactor.DEFAULT_HANDLERS, ...handlers };

    // Begin listening activities immediately.
    this.bindRegions(root);
    window.addEventListener('wheel', this.wheel.bind(this), false);
  }

  /**
   * Westures uses Gesture objects, and expects those objects to be bound to an
   * element, along with a handler for responding to that gesture. This method
   * takes care of those activities.
   */
  bindRegions(root) {
    const swipe = new Westures.Swipe(root, this.handlers.swipe);
    const swivel = new Westures.Swivel(root, this.swivel.bind(this), { enableKeys: ['ctrlKey'] });
    const tap = new Westures.Tap(root, this.handlers.tap);
    const track = new Westures.Track(root, this.handlers.track, { phases: ['start', 'end'] });
    const transform = new Transform(root, this.handlers.transform);

    const region = new Westures.Region(root);
    region.addGesture(tap);
    region.addGesture(swipe);
    region.addGesture(swivel);
    region.addGesture(transform);
    region.addGesture(track);
  }

  /**
   * Send a swivel event through as a transformation.
   */
  swivel({ rotation, pivot }) {
    this.handlers.transform({
      centroid: pivot,
      delta: { rotation },
    });
  }

  /**
   * Treat scrollwheel events as zoom events.
   *
   * @param {WheelEvent} event - The wheel event from the window.
   */
  wheel(event) {
    event.preventDefault();
    const factor = event.ctrlKey ? 0.02 : 0.1;
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
  swipe: NOP,
  tap: NOP,
  track: NOP,
  transform: NOP,
});

module.exports = Interactor;
