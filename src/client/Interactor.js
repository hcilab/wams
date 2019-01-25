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

class Swivel extends Westures.Gesture {
  constructor(deadzoneRadius = 10) {
    super('swivel');
    this.deadzoneRadius = deadzoneRadius;
  }

  start(state) {
    const started = state.getInputsInPhase('start')[0];
    const progress = started.getProgressOfGesture(this.id);
    const current = started.current;
    const point = current.point;
    const event = current.originalEvent;
    if (event.ctrlKey) {
      progress.pivot = point;
    }
  }

  move(state) {
    const active = state.getInputsNotInPhase('end');
    if (active.length === 1) {
      const input = active[0];

      if (input.totalDistanceIsWithin(this.deadzoneRadius)) {
        return null;
      }

      const event = input.current.originalEvent;
      const progress = input.getProgressOfGesture(this.id);
      if (event.ctrlKey && progress.pivot) {
        const point = input.current.point;
        const pivot = progress.pivot;
        const angle = pivot.angleTo(point);
        let delta = 0;
        if (progress.hasOwnProperty('previousAngle')) {
          delta = angle - progress.previousAngle;
        }
        progress.previousAngle = angle;
        return { delta, pivot, point };
      } else {
        // CTRL key was released, therefore pivot point is now invalid.
        delete progress.pivot;
      }
    }
  }
}

class Track extends Westures.Gesture {
  constructor(phases = []) {
    super('track');
    this.trackStart = phases.includes('start');
    this.trackMove = phases.includes('move');
    this.trackEnd = phases.includes('end');
  }

  data(state) {
    return {
      inputs: state.inputs,
      centroid: state.centroid,
    };
  }

  start(state) {
    if (this.trackStart) return this.data(state);
  }

  move(state) {
    if (this.trackMove) return this.data(state);
  }

  end(state) {
    if (this.trackEnd) return this.data(state);
  }
}

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
    this.region.bind(this.canvas, this.panner(),    this.forwarder('pan'));
    this.region.bind(this.canvas, this.tapper(),    this.forwarder('tap'));
    this.region.bind(this.canvas, this.pincher(),   this.forwarder('zoom'));
    this.region.bind(this.canvas, this.rotater(),   this.forwarder('rotate'));
    this.region.bind(this.canvas, this.swiper(),    this.forwarder('swipe'));
    this.region.bind(this.canvas, this.swiveller(), this.forwarder('rotate'));
    this.region.bind(this.canvas, this.tracker(),   this.forwarder('track'));
  }

  /**
   * Calls the handler for the given gesture, supplying the given data.
   */
  forward(gesture, data) {
    this.handlers[gesture](data);
  }

  /**
   * Generates a function that forwards the appropriate gesture and data.
   */
  forwarder(gesture) {
    function do_forward(data) {
      this.forward(gesture, data);
    }
    return do_forward.bind(this);
  }

  /**
   * Obtain the appropriate Westures Gesture object.
   */
  panner() {
    return new Westures.Pan({ muteKey: 'ctrlKey' });
  }

  /**
   * Obtain the appropriate Westures Gesture object.
   */
  pincher() {
    return new Westures.Pinch({ minInputs: 2 });
  }

  /**
   * Obtain the appropriate Westures Gesture object.
   */
  rotater() {
    return new Westures.Rotate();
  }

  /**
   * Obtain the appropriate Westures Gesture object.
   */
  swiper() {
    return new Westures.Swipe();
  }

  /**
   * Obtain the custom Swivel Gesture object.
   */
  swiveller() {
    return new Swivel();
  }

  /**
   * Obtain the appropriate Westures Gesture object.
   */
  tapper() {
    return new Westures.Tap({ tolerance: 10 });
  }

  /**
   * Obtain the appropriate Westures Gesture object.
   */
  tracker() {
    return new Track(['start', 'end']);
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

