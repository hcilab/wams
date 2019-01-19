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
      return { pivot: point };
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
        let change = 0;
        if (progress.hasOwnProperty('previousAngle')) {
          change = angle - progress.previousAngle;
        }
        progress.previousAngle = angle;
        return { change, pivot, point };
      } else {
        delete progress.pivot;
      }
    }
  }

  end(state) {
    return { pivot: {x: 0, y: 0}};
  }
}

const HANDLERS = Object.freeze({ 
  pan:    NOP,
  rotate: NOP,
  swipe:  NOP,
  tap:    NOP,
  zoom:   NOP,
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

    /**
     * The scaleFactor is a value by which the "changes" in pinches will be
     * multiplied. This should effectively normalize pinches across devices
     */
    this.scaleFactor = 2000 / (window.innerHeight * window.innerWidth)
    this.lastDesktopAngle = null;

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
    // window.addEventListener('mousemove', this.rotateDesktop.bind(this), {
    //   capture: true
    // });
  }

  /**
   * Westures uses Gesture objects, and expects those objects to be bound to an
   * element, along with a handler for responding to that gesture. This method
   * takes care of those activities.
   */
  bindRegions() {
    const pan     = this.pan.bind(this);
    const tap     = this.tap.bind(this);
    const pinch   = this.pinch.bind(this);
    const rotate  = this.rotate.bind(this);
    const swipe   = this.swipe.bind(this);
    const swivel  = this.swivel.bind(this);

    this.region.bind(this.canvas, this.panner(),    pan);
    this.region.bind(this.canvas, this.tapper(),    tap);
    this.region.bind(this.canvas, this.pincher(),   pinch);
    this.region.bind(this.canvas, this.rotater(),   rotate);
    this.region.bind(this.canvas, this.swiper(),    swipe);
    this.region.bind(this.canvas, this.swiveller(), swivel);
  }

  /**
   * Transform data received from Westures and forward to the registered
   * handler.
   */
  pan({ change, point, phase }) {
    change = guaranteeCoordinates(change);
    point = guaranteeCoordinates(point);
    this.handlers.pan( point.x, point.y, change.x, change.y, phase );
  }

  /**
   * Obtain the appropriate Westures Gesture object.
   */
  panner() {
    return new Westures.Pan({ muteKey: 'ctrlKey' });
  }

  /**
   * Transform data received from Westures and forward to the registered
   * handler.
   */
  pinch({ change, midpoint, phase }) {
    this.handlers.zoom( 
      // change * this.scaleFactor,
      change,
      midpoint.x,
      midpoint.y,
      phase 
    );
  }

  /**
   * Obtain the appropriate Westures Gesture object.
   */
  pincher() {
    return new Westures.Pinch({ minInputs: 2 });
  }

  /**
   * Transform data received from Westures and forward to the registered
   * handler.
   */
  rotate({ delta, pivot, phase }) {
    this.handlers.rotate( delta, pivot.x, pivot.y, phase );
  }

  /**
   * Respond to mouse events on the desktop to detect single-pointer rotates.
   * Require the CTRL key to be down.
   */
  rotateDesktop(event) {
    const { buttons, ctrlKey, clientX, clientY } = event;
    const mx = window.innerWidth / 2;
    const my = window.innerHeight / 2;
    const angle = Math.atan2(clientX - mx, clientY - my);
    let diff = 0;
    if (this.lastDesktopAngle !== null) diff = this.lastDesktopAngle - angle;
    this.lastDesktopAngle = angle;
    if ( ctrlKey && buttons & 1 ) {
      this.handlers.rotate( diff, mx, my ); 
    }
  }

  /**
   * Obtain the appropriate Westures Gesture object.
   */
  rotater() {
    return new Westures.Rotate();
  }

  /**
   * Transform data received from Westures and forward to the registered
   * handler.
   */
  swipe({ velocity, x, y, direction, phase }) {
    this.handlers.swipe(velocity, x, y, direction, phase);
  }

  /**
   * Obtain the appropriate Westures Gesture object.
   */
  swiper() {
    return new Westures.Swipe();
  }

  /**
   * Transform data received from Westures and forward to the registered
   * handler.
   */
  swivel({ change, pivot, point, phase }) { 
    this.handlers.rotate( change, pivot.x, pivot.y, phase );
  }

  /**
   * Obtain the custom Swivel Gesture object.
   */
  swiveller() {
    return new Swivel();
  }

  /**
   * Transform data received from Westures and forward to the registered
   * handler.
   */
  tap({ x, y, phase }) {
    this.handlers.tap( x, y, phase );
  }

  /**
   * Obtain the appropriate Westures Gesture object.
   */
  tapper() {
    return new Westures.Tap({ tolerance: 4 });
  }

  /**
   * Treat scrollwheel events as zoom events.
   */
  wheel(event) {
    event.preventDefault();
    const factor = event.ctrlKey ? 0.02 : 0.10;
    const diff = -(Math.sign(event.deltaY) * factor) + 1;
    this.handlers.zoom(diff, event.clientX, event.clientY, 'move');
  }
}

function guaranteeCoordinates(o = {}) {
  o.x = o.x || 0;
  o.y = o.y || 0;
  return o;
}

module.exports = Interactor;

