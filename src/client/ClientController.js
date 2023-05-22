'use strict';

const { io } = require('socket.io-client');

const { constants, Message, NOP } = require('../shared.js');
const Interactor = require('./Interactor.js');

// Symbols to identify these methods as intended only for internal use
const symbols = Object.freeze({
  attachSocketIoListeners: Symbol('attachSocketIoListeners'),
  render: Symbol('render'),
});

/**
 * The ClientController coordinates communication with the wams server. It sends
 * messages based on user interaction with the canvas and receives messages from
 * the server detailing changes to post to the view.
 *
 * @memberof module:client
 *
 * @param {HTMLCanvasElement} canvas - The underlying CanvasElement object, (not
 * the context), which will fill the page.
 * @param {module:client.ClientView} view - The view that will handle rendering
 * duties.
 * @param {module:client.ClientModel} model - The client-side copy of the
 * server's model.
 */
class ClientController {
  constructor(root, canvas, view, model) {
    /**
     * Root element where WAMS canvas and HTML elements are located.
     *
     * @type {Element}
     */
    this.rootElement = root;

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
     * List of custom event names that will be listened to.
     *
     * @type {array}
     */
    this.eventListeners = [];

    /**
     * Queue of events to be called once Client-side listeners are set up.
     *
     * @type {array}
     */
    this.eventQueue = [];

    /**
     * Tracks whether a render has been scheduled for the next render frame.
     *
     * @type {boolean}
     */
    this.renderScheduled = false;

    /**
     * Bound reference to the render method, for use as a callback.
     *
     * @type {function}
     */
    this.render_fn = this[symbols.render].bind(this);

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
   * This internal routine should be called as part of socket establishment.
   *
   * @alias [@@attachSocketIoListeners]
   * @memberof module:client.ClientController
   */
  [symbols.attachSocketIoListeners]() {
    const listeners = {
      // For the server to inform about changes to the model
      [Message.ADD_ELEMENT]: (data) => this.model.addElement(data),
      [Message.ADD_IMAGE]: (data) => this.model.addImage(data),
      [Message.ADD_ITEM]: (data) => this.model.addItem(data),
      [Message.ADD_SHADOW]: (data) => this.model.addShadow(data),
      [Message.RM_ITEM]: (data) => this.model.removeItem(data),
      [Message.RM_SHADOW]: (data) => this.model.removeShadow(data),
      [Message.UD_ITEM]: (data) => this.model.updateItem(data),
      [Message.UD_SHADOW]: (data) => this.model.updateShadow(data),
      [Message.UD_VIEW]: (data) => this.model.updateView(data),

      // For hopefully occasional extra adjustments to objects in the model.
      [Message.RM_ATTRS]: (data) => this.model.removeAttributes(data),
      [Message.SET_ATTRS]: (data) => this.model.setAttributes(data),
      [Message.SET_IMAGE]: (data) => this.model.setImage(data),
      [Message.SET_RENDER]: (data) => this.model.setRender(data),
      [Message.SET_PARENT]: (data) => this.model.setParent(data),

      // Connection establishment related (disconnect, initial setup)
      [Message.INITIALIZE]: this.initialize.bind(this),
      [Message.LAYOUT]: NOP,

      // User event related
      [Message.CLICK]: NOP,
      [Message.RESIZE]: NOP,
      [Message.SWIPE]: NOP,
      [Message.TRACK]: NOP,
      [Message.TRANSFORM]: NOP,

      // Multi-device gesture related
      [Message.POINTER]: NOP,
      [Message.BLUR]: NOP,

      // TODO: This could be more... elegant...
      [Message.FULL]: () => {
        document.body.innerHTML = 'WAMS is full! :(';
      },

      // For user-defined behavior
      [Message.DISPATCH]: this.handleCustomEvent.bind(this),
    };

    Object.entries(listeners).forEach(([p, v]) => this.socket.on(p, v));
    this.socket.onAny(this.scheduleRender.bind(this));

    // Keep the view size up to date.
    window.addEventListener('resize', this.resize.bind(this), false);

    /*
     * As no automatic draw loop is used, (there are no animations), need to
     * know when to re-render in response to an image loading.
     */
    const scheduleFn = this.scheduleRender.bind(this);
    document.addEventListener(Message.IMG_LOAD, scheduleFn);
  }

  /**
   * Establishes a socket.io connection with the server, using the global WAMS
   * namespace. Connections should be non-persistent over disconnects, (i.e., no
   * reconnections), as this was the cause of many bugs.
   *
   * This internal routine should be called automatically upon ClientController
   * instantiation.
   */
  connect() {
    this.socket = io(constants.NS_WAMS, {
      autoConnect: false,
      reconnection: false,
      transports: ['websocket', 'polling'],
    });
    this[symbols.attachSocketIoListeners]();
    window.requestAnimationFrame(this.render_fn);
    this.socket.connect();
  }

  /**
   * Renders a frame.
   *
   * @alias [@@render]
   * @memberof module:client.ClientController
   */
  [symbols.render]() {
    if (this.renderScheduled) {
      this.view.draw();
      this.renderScheduled = false;
    }
    window.requestAnimationFrame(this.render_fn);
  }

  /**
   * @param {object} data
   */
  handleCustomEvent(data) {
    if (this.eventListeners.indexOf(data.action) < 0) {
      this.eventQueue.push(data);
    }
    this.model.dispatch(data);
  }

  /**
   * For responding to window resizing by the user. Resizes the canvas to fit
   * the new window size, and reports the change to the server so it can be
   * reflected in the model.
   */
  resize() {
    this.resizeCanvasToFillWindow();
    this.socket.emit(Message.RESIZE, this.view);
    this.view.draw();
  }

  /**
   * Stretches the canvas to fit the available window space, and updates the
   * view accordingly.
   *
   * Note: Scaling to account for device pixel ratio is disabled for iOS
   * as a workaround for a bug with Safari and Chrome, where `context.setTransform`
   * would make the page unresponsive.
   */
  resizeCanvasToFillWindow() {
    const iOS = /iPad|iPhone|iPod|Apple/.test(window.navigator.platform);
    const dpr = iOS ? 1 : window.devicePixelRatio || 1;
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.canvas.width = w * dpr;
    this.canvas.height = h * dpr;
    this.canvas.style.width = `${w}px`;
    this.canvas.style.height = `${h}px`;
    this.view.resizeToFillWindow(dpr, iOS);
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
  initialize(data) {
    const { clientScripts, stylesheets, title, backgroundImage, color, useMultiScreenGestures } = data.settings;
    if (clientScripts) this.loadClientScripts(clientScripts);
    if (stylesheets) this.loadStylesheets(stylesheets);
    document.title = title;

    this.view.id = data.viewId;

    if (backgroundImage) {
      this.canvas.style.backgroundColor = 'transparent';
      document.body.style.backgroundImage = `url("${backgroundImage}")`;
    } else {
      this.canvas.style.backgroundColor = color;
    }
    this.model.initialize(data);
    this.setUpInteractor(useMultiScreenGestures);

    // Need to tell the model what the view looks like once setup is complete.
    this.socket.emit(Message.LAYOUT, this.view);
  }

  loadClientScripts(scripts) {
    scripts.forEach((src) => {
      const script = document.createElement('script');
      script.src = src;
      document.body.appendChild(script);
    });
  }

  loadStylesheets(stylesheets) {
    stylesheets.forEach((src) => {
      const link = document.createElement('link');
      link.href = src;
      link.type = 'text/css';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    });
  }

  /**
   * The Interactor is a level of abstraction between the ClientController and
   * the gesture recognition library such that libraries can be swapped out
   * more easily, if need be. At least in theory. All the ClientController
   * needs to provide is handler functions for responding to the recognized
   * gestures.
   *
   * @param {boolean} [useMultiScreenGestures=false] Whether to use server-side
   * gestures. Default is to use client-side gestures.
   */
  setUpInteractor(useMultiScreenGestures = false) {
    this.setUpInputForwarding();
    if (!useMultiScreenGestures) {
      return new Interactor(this.rootElement, {
        swipe: this.socket.emit.bind(this.socket, Message.SWIPE),
        tap: this.socket.emit.bind(this.socket, Message.CLICK),
        track: this.socket.emit.bind(this.socket, Message.TRACK),
        transform: this.socket.emit.bind(this.socket, Message.TRANSFORM),
      });
    }
  }

  /**
   * Set up input event forwarding.
   */
  setUpInputForwarding() {
    // Forward pointer events
    ['pointerdown', 'pointermove', 'pointerup'].forEach((eventname) => {
      window.addEventListener(eventname, (event) => {
        // Extract only the properties we care about
        const { type, pointerId, clientX, clientY, target, altKey, ctrlKey, metaKey, shiftKey } = event;
        this.socket.emit(Message.POINTER, {
          type,
          pointerId,
          clientX,
          clientY,
          target,
          altKey,
          ctrlKey,
          metaKey,
          shiftKey,
        });
      });
    });

    // Forward blur and cancel events as "BLUR" messages
    ['pointercancel', 'blur'].forEach((eventname) => {
      window.addEventListener(eventname, (event) => {
        this.socket.emit(Message.BLUR, {});
      });
    });
  }

  /**
   * Dispatch a custom ServerEvent.
   *
   * @param {string} action
   * @param {object} payload
   */
  dispatch(action, payload) {
    this.socket.emit(Message.DISPATCH, { action, payload });
  }
}

module.exports = ClientController;
