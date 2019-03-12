/*
 * WAMS code to be executed in the client browser.
 *
 * Author: Michael van der Kamp
 * Date: July 2018 - January 2019
 *
 * Original author: Jesse Rolheiser
 * Other revisions and supervision: Scott Bateman
 */

'use strict';

const io = require('socket.io-client');

const {
  constants,
  DataReporter,
  PointerReporter,
  IdStamper,
  Message,
  NOP,
} = require('../shared.js');
const Interactor = require('./Interactor.js');

const STAMPER = new IdStamper();
const FRAME_RATE = 1000 / 60;

// Symbols to identify these methods as intended only for internal use
const symbols = Object.freeze({
  attachListeners: Symbol('attachListeners'),
  render:          Symbol('render'),
  startRender:     Symbol('startRender'),
});

/**
 * The ClientController coordinates communication with the wams server. It sends
 * messages based on user interaction with the canvas and receives messages from
 * the server detailing changes to post to the view.
 *
 * @memberof module:client
 */
class ClientController {
  /**
   * @param {HTMLCanvasElement} canvas - The underlying CanvasElement object,
   *    (not the context), which will fill the page.
   * @param {module:client.ClientView} view - The view that will handle
   * rendering duties.
   * @param {module:client.ClientModel} model - The client-side copy of the
   * server's model.
   */
  constructor(canvas, view, model) {
    /**
     * The HTMLCanvasElement object is stored by the ClientController so that it
     * is able to respond to user events triggered on the canvas. The view only
     * needs to know about the canvas drawing context.
     *
     * @type {HTMLCanvasElement}
     */
    this.canvas = canvas;

    /**
     * From socket.io, the socket provides a channel of communication with the
     * server.
     *
     * @type {Socket}
     * @see {@link https://socket.io/docs/client-api/}
     */
    this.socket = null;

    /**
     * The ClientModel is a client-side copy of the workspace model, kept up to
     * date by the controller.
     *
     * @type {module:client.ClientModel}
     */
    this.model = model;

    /**
     * The ClientView handles the final rendering of the model, as informed by
     * the controller.
     *
     * @type {module:client.ClientView}
     */
    this.view = view;

    /**
     * Tracks whether a render has been scheduled for the next render frame.
     *
     * @type {boolean}
     */
    this.renderScheduled = false;

    /*
     * For proper function, we need to make sure that the canvas is as large as
     * it can be at all times, and that at all times we know how big the canvas
     * is.
     */
    this.resizeCanvasToFillWindow();
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
      [Message.ADD_IMAGE]:  (...args) => this.handle('addImage', ...args),
      [Message.ADD_ITEM]:   (...args) => this.handle('addItem', ...args),
      [Message.ADD_SHADOW]: (...args) => this.handle('addShadow', ...args),
      [Message.RM_ITEM]:    (...args) => this.handle('removeItem', ...args),
      [Message.RM_SHADOW]:  (...args) => this.handle('removeShadow', ...args),
      [Message.SET_IMAGE]:  ({ data }) => this.handle('setImage', data),
      [Message.SET_RENDER]: ({ data }) => this.handle('setRender', data),
      [Message.UD_ITEM]:    (...args) => this.handle('updateItem', ...args),
      [Message.UD_SHADOW]:  (...args) => this.handle('updateShadow', ...args),
      [Message.UD_VIEW]:    (...args) => this.handle('updateView', ...args),

      // Connection establishment related (disconnect, initial setup)
      [Message.INITIALIZE]: (...args) => this.setup(...args),
      [Message.LAYOUT]:     NOP,

      // User event related
      [Message.CLICK]:   NOP,
      [Message.DRAG]:    NOP,
      [Message.RESIZE]:  NOP,
      [Message.ROTATE]:  NOP,
      [Message.SCALE]:   NOP,
      [Message.SWIPE]:   NOP,
      [Message.TRACK]:   NOP,

      // Multi-device gesture related
      [Message.POINTER]: NOP,
      [Message.BLUR]:    NOP,

      // TODO: This could be more... elegant...
      [Message.FULL]: () => {
        document.body.innerHTML = 'WAMS is full! :(';
      },
    };

    Object.entries(listeners).forEach(([p, v]) => this.socket.on(p, v));

    // Keep the view size up to date.
    window.addEventListener('resize', this.resize.bind(this), false);

    /*
     * As no automatic draw loop is used, (there are no animations), need to
     * know when to re-render in response to an image loading.
     */
    const schedule_fn = this.scheduleRender.bind(this);
    document.addEventListener(Message.IMG_LOAD, schedule_fn);
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
  connect() {
    this.socket = io.connect(constants.NS_WAMS, {
      autoConnect:  false,
      reconnection: false,
    });
    this[symbols.attachListeners]();
    this[symbols.startRender]();
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
    window.setInterval(render_fn, FRAME_RATE);
  }

  /**
   * Generates a function for forwarding the given message to the server.
   *
   * @see {@link module:shared.Message}
   *
   * @param {string} message - The type of message to forward. One of the static
   * members of the Message class.
   *
   * @return {Function} A function bound to this instance for forwarding data to
   * the server with the given message type label.
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
   * @see {@link module:shared.Message}
   *
   * @param {string} message - The name of a ClientView method to run.
   * @param {...mixed} ...args - The arguments to pass to the ClientView method.
   */
  handle(message, ...args) {
    this.model[message](...args);
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
    this.view.draw();
  }

  /**
   * Stretches the canvas to fit the available window space, and updates the
   * view accordingly.
   */
  resizeCanvasToFillWindow() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.view.resizeToFillWindow();
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
   *
   * @param {module:shared.FullStateReporter} data - All the information
   * necessary to initially synchronize this client's model with the server's
   * model.
   */
  setup(data) {
    STAMPER.cloneId(this.view, data.id);

    this.canvas.style.backgroundColor = data.color;
    this.model.setup(data);
    this.setupInteractor(data.useServerGestures);

    // Need to tell the model what the view looks like once setup is complete.
    new Message(Message.LAYOUT, this.view).emitWith(this.socket);
  }

  /**
   * Set the image for the appropriate item.
   *
   * @param {object} data
   */
  setImage(data) {
    this.model.setImage(data);
  }

  /**
   * Set the canvas rendering sequence for the appropriate item.
   *
   * @param {object} data
   */
  setRender(data) {
    this.model.setRender(data);
  }

  /**
   * The Interactor is a level of abstraction between the ClientController and
   * the gesture recognition library such that libraries can be swapped out
   * more easily, if need be. At least in theory. All the ClientController
   * needs to provide is handler functions for responding to the recognized
   * gestures.
   *
   * @param {boolean} [useServerGestures=false] Whether to use server-side
   * gestures. Default is to use client-side gestures.
   */
  setupInteractor(useServerGestures = false) {
    if (useServerGestures) {
      this.setupInputForwarding();
      ['touchcancel', 'pointercancel', 'blur'].forEach(eventname => {
        window.addEventListener(eventname, (event) => {
          event.preventDefault();
          const breport = new DataReporter();
          new Message(Message.BLUR, breport).emitWith(this.socket);
        });
      });
    } else {
      new Interactor(this.canvas, {
        pan:    this.forward(Message.DRAG),
        rotate: this.forward(Message.ROTATE),
        swipe:  this.forward(Message.SWIPE),
        tap:    this.forward(Message.CLICK),
        zoom:   this.forward(Message.SCALE),
        track:  this.forward(Message.TRACK),
      });
    }
  }

  /**
   * Set up input event forwarding.
   */
  setupInputForwarding() {
    if (window.PointerEvent) {
      this.forwardPointerEvents();
    } else {
      this.forwardMouseAndTouchEvents();
    }
  }

  /**
   * Forward pointer events.
   */
  forwardPointerEvents() {
    ['pointerdown', 'pointermove', 'pointerup'].forEach(eventname => {
      window.addEventListener(
        eventname,
        (event) => {
          event.preventDefault();
          const preport = new PointerReporter(event);
          new Message(Message.POINTER, preport).emitWith(this.socket);
        },
        {
          capture: true,
          once:    false,
          passive: false,
        }
      );
    });
  }

  /**
   * Forward mouse and touch events.
   */
  forwardMouseAndTouchEvents() {
    ['mousedown', 'mousemove', 'mouseup'].forEach(eventname => {
      window.addEventListener(
        eventname,
        (event) => {
          event.preventDefault();
          const preport = new PointerReporter(event);
          preport.pointerId = event.button;
          new Message(Message.POINTER, preport).emitWith(this.socket);
        },
        {
          capture: true,
          once:    false,
          passive: false,
        }
      );
    });

    ['touchstart', 'touchmove', 'touchend'].forEach(eventname => {
      window.addEventListener(
        eventname,
        (event) => {
          event.preventDefault();
          Array.from(event.changedTouches).forEach(touch => {
            const preport = new PointerReporter(touch);
            preport.type = event.type;
            preport.pointerId = touch.identifier;
            new Message(Message.POINTER, preport).emitWith(this.socket);
          });
        },
        {
          capture: true,
          once:    false,
          passive: false,
        }
      );
    });
  }
}

module.exports = ClientController;

