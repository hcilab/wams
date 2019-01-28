/*
 * WAMS code to be executed in the client browser.
 *
 * Author: Michael van der Kamp
 *  |-> Date: July/August 2018
 *
 * Original author: Jesse Rolheiser
 * Other revisions and supervision: Scott Bateman
 *
 * The Interactor class provides a layer of abstraction between the
 * ClientController and the code that processes user inputs.
 */

'use strict';

const Westures = require('../../../westures');
// const Westures = require('westures');
const { mergeMatches, NOP } = require('../shared.js');

const HANDLERS = Object.freeze({ 
  pan:    NOP,
  rotate: NOP,
  swipe:  NOP,
  tap:    NOP,
  zoom:   NOP,
  track:  NOP,
});

/**
 * Currently, the Interactor makes use of the Westures library.
 *
 * General Design:
 *  The handlers will get called with the arguments that need to be reported
 *  through to the server. This allows the ClientController to use this class
 *  in a very simple way. This is the contract between the Interactor and the
 *  ClientController, and must be honoured.
 *
 *  The handlers are initialized to NOPs so that the functions which call the
 *  handlers don't need to check whether the handler exists.
 *
 *  The methods of this class that are similarly named as the handlers are
 *  there as an intermediary to collect data from events and call the handlers
 *  with only the requisite data.
 */
class Interactor {
  /**
   * canvas  : The <canvs> element on which to listen for interaction events.
   * handlers: Object with keys as the names gestures and values as the
   *           corresponding function for handling that gesture when it is
   *           recognized.
   */
  constructor(canvas, handlers = {}) {
    if (!(canvas instanceof HTMLCanvasElement)) {
      throw 'Invalid canvas recieved by Interactor!';
    }

    this.canvas = canvas;
    this.region = new Westures.Region(window);

    this.handlers = mergeMatches(HANDLERS, handlers);
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
   */
  bindRegions() {
    const pan     = new Westures.Pan({ muteKey: 'ctrlKey' });
    const rotate  = new Westures.Rotate();
    const pinch   = new Westures.Pinch();
    const swipe   = new Westures.Swipe();
    const swivel  = new Westures.Swivel({ enableKey: 'ctrlKey' });
    const tap     = new Westures.Tap();
    const track   = new Westures.Track(['start', 'end']);

    this.region.bind(this.canvas, pan,    this.forward('pan'));
    this.region.bind(this.canvas, tap,    this.forward('tap'));
    this.region.bind(this.canvas, pinch,  this.forward('zoom'));
    this.region.bind(this.canvas, rotate, this.forward('rotate'));
    this.region.bind(this.canvas, swipe,  this.forward('swipe'));
    this.region.bind(this.canvas, swivel, this.forward('rotate'));
    this.region.bind(this.canvas, track,  this.forward('track'));
  }

  /**
   * Generates a function that forwards the appropriate gesture and data.
   */
  forward(gesture) {
    function do_forward(data) {
      this.handlers[gesture](data);
    }
    return do_forward.bind(this);
  }

  /**
   * Treat scrollwheel events as zoom events.
   */
  wheel(event) {
    event.preventDefault();
    const factor = event.ctrlKey ? 0.02 : 0.10;
    const change = -(Math.sign(event.deltaY) * factor) + 1;
    const midpoint = {x: event.clientX, y: event.clientY};
    const phase = 'move';
    this.handlers.zoom({ change, midpoint, phase });
  }
}

module.exports = Interactor;

