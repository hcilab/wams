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

const io = require('socket.io-client');

const { 
  constants, 
  DataReporter,
  IdStamper, 
  Message, 
  NOP,
} = require('../shared.js');
const ClientView = require('./ClientView.js');
const Interactor = require('./Interactor.js');

const STAMPER = new IdStamper();

// symbols to identify these methods as intended only for internal use
const symbols = Object.freeze({
  attachListeners: Symbol('attachListeners'),
  establishSocket: Symbol('establishSocket'),
  render:          Symbol('render'),
  startRender:     Symbol('startRender'),
});

/**
 * The ClientController coordinates communication with the wams server. It sends
 * messages based on user interaction with the canvas and receives messages from
 * the server detailing changes to post to the view. This is essentially the
 * controller in an MVC-esque design.
 */
class ClientController { 
  /**
   * canvas: The underlying CanvasRenderingContext2D object, (not the context),
   *         which will fill the page.
   */
  constructor(canvas) {
    /**
     * The CanvasRenderingContext2D object is stored by the ClientController so
     * that it is able to respond to user events triggered on the canvas. The
     * view only needs to know about the canvas drawing context.
     */
    this.canvas = canvas;
    
    /**
     * From socket.io, the socket provides a channel of communication with the
     * server.
     */
    this.socket = null;

    /**
     * The ClientView handles the final rendering of the model, as informed by
     * the controller, and as such needs to konw the canvas rendering context.
     */
    this.view = new ClientView({ context: this.canvas.getContext('2d') });

    /**
     * The Interactor is a level of abstraction between the ClientController and
     * the gesture recognition library such that libraries can be swapped out
     * more easily, if need be. At least in theory. All the ClientController
     * needs to provide is handler functions for responding to the recognized
     * gestures.
     */
    this.interactor = new Interactor(this.canvas, {
      pan:    this.forward(Message.DRAG),
      rotate: this.forward(Message.ROTATE),
      swipe:  this.forward(Message.SWIPE),
      tap:    this.forward(Message.CLICK),
      zoom:   this.forward(Message.SCALE),
      track:  this.forward(Message.TRACK),
    });

    /**
     * This boolean tracks whether a render has been schedule for the next
     * 1/60th of a second interval.
     */
    this.renderScheduled = false;

    // For proper function, we need to make sure that the canvas is as large as
    // it can be at all times, and that at all times we know how big the canvas
    // is.
    this.resizeCanvasToFillWindow();
    window.addEventListener('resize', this.resize.bind(this), false);

    // Automatically establish a socket connection with the server. This may
    // need to be changed to be non-automatic if it is discovered that it is
    // useful for functionality to be inserted between ClientController
    // instantiation and socket establishment.
    this[symbols.establishSocket]();
    this[symbols.startRender]();


    // As no draw loop is used, (there are no animations), need to know when to
    // re-render in response to an image loading.
    const schedule_fn = this.scheduleRender.bind(this);
    document.addEventListener( Message.IMG_LOAD, schedule_fn );
  }

  /**
   * Attaches listeners to messages received over the socket connection. All
   * received messages at this layer should be those conforming to the Message /
   * Reporter protocol.
   *
   * This internal routine will be called as part of socket establishment.
   */
  [symbols.attachListeners]() {
    const listeners = {
      // For the server to inform about changes to the model
      [Message.ADD_ITEM]:   (...args) => this.handle('addItem', ...args),
      [Message.ADD_SHADOW]: (...args) => this.handle('addShadow', ...args),
      [Message.RM_ITEM]:    (...args) => this.handle('removeItem', ...args),
      [Message.RM_SHADOW]:  (...args) => this.handle('removeShadow', ...args),
      [Message.UD_ITEM]:    (...args) => this.handle('updateItem', ...args),
      [Message.UD_SHADOW]:  (...args) => this.handle('updateShadow', ...args),
      [Message.UD_VIEW]:    (...args) => this.handle('assign', ...args),

      // Connection establishment related (disconnect, initial setup)
      [Message.INITIALIZE]: (...args) => this.setup(...args),
      [Message.LAYOUT]:     NOP,

      // User event related
      [Message.CLICK]:  NOP,
      [Message.DRAG]:   NOP,
      [Message.RESIZE]: NOP,
      [Message.ROTATE]: NOP,
      [Message.SCALE]:  NOP,
      [Message.SWIPE]:  NOP,
      [Message.TRACK]:  NOP,

      // TODO: This could be more... elegant...
      [Message.FULL]: () => document.body.innerHTML = 'WAMS is full! :(',
    };

    Object.entries(listeners).forEach( ([p,v]) => this.socket.on(p, v) );
  }

  /**
   * Establishes a socket.io connection with the server, using the global WAMS
   * namespace. Connections should be non-persistent over disconnects, (i.e., no
   * reconnections), as this was the cause of many bugs. 
   *  - TODO: Revisit? Should reconnections be allowed?
   *
   * This internal routine should be called automatically upon ClientController
   * instantiation.
   */
  [symbols.establishSocket]() {
    this.socket = io.connect( constants.NS_WAMS, {
      autoConnect: false,
      reconnection: false,
    });
    this[symbols.attachListeners]();
    this.socket.connect();
  }

  /**
   * Renders a frame.
   */
  [symbols.render]() {
    if (this.renderScheduled) {
      this.view.draw();
      this.renderScheduled = false;
    }
  }

  /**
   * Initializes the render loop.
   */
  [symbols.startRender]() {
    const render_fn = this[symbols.render].bind(this);
    window.setInterval( render_fn, 1000 / 60 );
  }

  /**
   * Generates a function for forwarding the given message to the server.
   */
  forward(message) {
    function do_forward(data) {
      const dreport = new DataReporter({ data });
      new Message(message, dreport).emitWith(this.socket);
    }
    return do_forward.bind(this);
  }

  /**
   * Passes messages to the View, and schedules a render.
   *
   * message: string denoting type of message. 
   * ...args: arguments to be passed to ultimate handler.
   */
  handle(message, ...args) {
    this.view.handle(message, ...args);
    this.scheduleRender();
  }

  /**
   * For responding to window resizing by the user. Resizes the canvas to fit
   * the new window size, and reports the change to the server so it can be
   * reflected in the model.
   */
  resize() {
    this.resizeCanvasToFillWindow();
    new Message(Message.RESIZE, this.view).emitWith(this.socket);
  }

  /**
   * Stretches the canvas to fit the available window space, and updates the
   * view accordingly.
   */
  resizeCanvasToFillWindow() {
    this.canvas.width = window.innerWidth; 
    this.canvas.height = window.innerHeight;
    this.handle('resizeToFillWindow');
  }

  /**
   * Schedules a render for the next frame interval.
   */
  scheduleRender() {
    this.renderScheduled = true;
  }

  /**
   * As this object will be instantiated on page load, and will generate a view
   * before communication lines with the server have been opened, the view will
   * not reflect the model automatically. This function responds to a message
   * from the server which contains the current state of the model, and forwards
   * this data to the view so that it can correctly render the model.
   */
  setup(data) {
    STAMPER.cloneId(this, data.id);
    this.canvas.style.backgroundColor = data.color;
    this.view.setup(data);

    // Need to tell the model what the view looks like once setup is complete.
    new Message(Message.LAYOUT, this.view).emitWith(this.socket);
  }
}

module.exports = ClientController;

