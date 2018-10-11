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

// const Westures = require('../../../zingtouch');
const Westures = require('../../../westures');
const { getInitialValues, NOP } = require('../shared.js');

/*
 * Currently, the Interactor makes use of the Westures library.
 *
 * General Design:
 *  The handlers will get called with the arguments that need to be reportd
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

const HANDLERS = Object.freeze({ 
  pan:    NOP,
  rotate: NOP,
  swipe:  NOP,
  tap:    NOP,
  zoom:   NOP,
});

class Interactor {
  constructor(canvas, handlers = {}) {
    this.canvas = canvas;
    this.region = new Westures.Region(window, true, true);
    this.handlers = getInitialValues(HANDLERS, handlers);
    this.bindRegions();
    window.addEventListener('wheel', this.wheel.bind(this), false);
  }

  bindRegions() {
    /*
     * this.region.bind() attaches a gesture recognizer and a callback to an
     * element.
     */
    const pan     = this.pan.bind(this);
    const tap     = this.tap.bind(this);
    const pinch   = this.pinch.bind(this);
    const rotate  = this.rotate.bind(this);
    // const swipe   = this.swipe.bind(this);

    this.region.bind(this.canvas, this.panner(), pan);
    this.region.bind(this.canvas, this.tapper(), tap);
    this.region.bind(this.canvas, this.pincher(), pinch);
    this.region.bind(this.canvas, this.rotater(), rotate);
    // this.region.bind(this.canvas, this.swiper(), swipe);
  }

  pan({ detail }) {
    const { change, point } = detail;
    this.handlers.pan( point.x, point.y, change.x, change.y);
  }

  panner() {
    return new Westures.Pan();
  }

  pinch({ detail }) {
    this.handlers.zoom(detail.change * 0.0025);
  }

  pincher() {
    return new Westures.Pinch();
  }

  rotate({ detail }) {
    this.handlers.rotate( detail.delta );
  }

  rotater() {
    return new Westures.Rotate();
  }

  swipe({ detail }) {
    const { acceleration, finalVelocity, finalPoint } = detail;
    this.handlers.swipe(acceleration, finalVelocity, finalPoint);
  }

  swiper() {
    return new Westures.Swipe();
  }

  tap({ detail }) {
    this.handlers.tap( detail.x, detail.y );
  }

  tapper() {
    return new Westures.Tap({ tolerance: 4 });
  }

  wheel(event) {
    event.preventDefault();
    const factor = event.ctrlKey ? 0.10 : 0.02;
    this.handlers.zoom(-(Math.sign(event.deltaY) * factor));
  }
}

module.exports = Interactor;

