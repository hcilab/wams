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

const Westures = require('../../../westures');
// const Westures = require('westures');
const { mergeMatches, NOP } = require('../shared.js');

/**
 * The Interactor class provides a layer of abstraction between the
 * ClientController and the code that processes user inputs.
 *
 * Data from recognized gestures is reported directly through to the handlers.
 *
 * The handlers are initialized to NOPs so that the functions which call the
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
   * @param {HTMLCanvasElement} canvas - The canvas element on which to listen
   *    for interaction events.
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
  constructor(canvas, handlers = {}) {
    // if (!(canvas instanceof HTMLCanvasElement)) {
    //   throw 'Invalid canvas recieved by Interactor!';
    // }

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
    this.handlers = mergeMatches(Interactor.DEFAULT_HANDLERS, handlers);

    // Begin listening activities immediately.
    // this.bindRegions(canvas);
    this.bindRegions();
    this.attachListeners();
  }

  /**
   * Attaches extra event listeners to provide functionality on top of what is
   * available in Westures by default.
   */
  attachListeners() {
    window.addEventListener('wheel', this.wheel.bind(this), false);
  }

  /**
   * Westures uses Gesture objects, and expects those objects to be bound to an
   * element, along with a handler for responding to that gesture. This method
   * takes care of those activities.
   *
   * @param {HTMLCanvasElement} canvas - The canvas element on which to listen
   * for gestures.
   */
  // bindRegions(canvas) {
  bindRegions() {
    const pan     = new Westures.Pan({ muteKey: 'ctrlKey' });
    const rotate  = new Westures.Rotate();
    const pinch   = new Westures.Pinch();
    const swipe   = new Westures.Swipe();
    const swivel  = new Westures.Swivel({ enableKey: 'ctrlKey' });
    const tap     = new Westures.Tap();
    const track   = new Westures.Track(['start', 'end']);

    const region = new Westures.Region(document.body);
    region.addGesture(document.body, pan,    this.forward('pan'));
    region.addGesture(document.body, tap,    this.forward('tap'));
    region.addGesture(document.body, pinch,  this.forward('zoom'));
    region.addGesture(document.body, rotate, this.forward('rotate'));
    region.addGesture(document.body, swipe,  this.forward('swipe'));
    region.addGesture(document.body, swivel, this.forward('rotate'));
    region.addGesture(document.body, track,  this.forward('track'));
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
    const change = -(Math.sign(event.deltaY) * factor) + 1;
    const midpoint = { x: event.clientX, y: event.clientY };
    const phase = 'move';
    this.handlers.zoom({ change, midpoint, phase });
  }
}

/**
 * The default handlers used by the Interactor.
 *
 * @type {object}
 */
Interactor.DEFAULT_HANDLERS = Object.freeze({
  pan:    NOP,
  rotate: NOP,
  swipe:  NOP,
  tap:    NOP,
  zoom:   NOP,
  track:  NOP,
});

module.exports = Interactor;

