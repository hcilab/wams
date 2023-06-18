'use strict';

const { Message, NOP } = require('../shared.js');
const Device = require('./Device.js');

// Symbols to mark these methods as intended for internal use only.
const symbols = Object.freeze({
  attachSocketIoListeners: Symbol('attachSocketIoListeners'),
  fullStateReport: Symbol('fullStateReport'),
});

/**
 * A ServerController maintains a socket.io connection between a client and the
 * server. It tracks a view associated with the client.
 *
 * @memberof module:server
 *
 * @param {number} index - The index of this ServerController in the workspace,
 * can be used as a unique identifier.
 * @param {Socket} socket - A socket.io connection with a client.
 * @param {module:server.Application} application - The WAMS application for
 * this controller.
 */
class ServerController {
  constructor(index, socket, application) {
    /**
     * The index is an integer identifying the ServerController, which can also
     * be used for locating the ServerController in a collection.
     *
     * @type {number}
     */
    this.index = index;

    /**
     * The socket is a socket.io connection with a client.
     *
     * @type {Socket}
     */
    this.socket = socket;

    /**
     * The WAMS application for this controller.
     *
     * @type {module:server.Application}
     */
    this.application = application;

    /**
     * The viewspace that this controller is currently in.
     *
     * @type {module:server.ViewSpace}
     */
    this.viewspace = application.viewspace;

    /**
     * The view corresponding to the client on the other end of this
     * ServerController.
     *
     * @type {module:server.ServerView}
     */
    this.view = this.viewspace.spawnView(this.socket, this.index);

    /**
     * The device corresponding to the client's device's physical orientation.
     *
     * @type {module:server.Device}
     */
    this.device = new Device();

    /*
     * Automatically begin operations by registering Message listeners and
     * Informing the client on the current state of the model.
     */
    this[symbols.attachSocketIoListeners]();
    this[symbols.fullStateReport]();
  }

  /**
   * Attaches listeners to the socket. Only listens to message types existing on
   * the Message class object.
   *
   * @alias [@@attachSocketIoListeners]
   * @memberof module:server.ServerController
   */
  [symbols.attachSocketIoListeners]() {
    const messageHandler = this.application.messageHandler;
    const handleGesture = messageHandler.handleGesture;
    const listeners = {
      // For the server to inform about changes to the model
      [Message.ADD_ELEMENT]: NOP,
      [Message.ADD_IMAGE]: NOP,
      [Message.ADD_ITEM]: NOP,
      [Message.ADD_SHADOW]: NOP,
      [Message.RM_ITEM]: NOP,
      [Message.RM_SHADOW]: NOP,
      [Message.UD_ITEM]: NOP,
      [Message.UD_SHADOW]: NOP,
      [Message.UD_VIEW]: NOP,

      // For hopefully occasional extra adjustments to objects in the model.
      [Message.RM_ATTRS]: NOP,
      [Message.SET_ATTRS]: NOP,
      [Message.SET_IMAGE]: NOP,
      [Message.SET_RENDER]: NOP,
      [Message.SET_PARENT]: NOP,

      // Connection establishment related (disconnect, initial setup)
      [Message.INITIALIZE]: NOP,
      [Message.LAYOUT]: this.layout.bind(this),

      // User event related
      [Message.CLICK]: handleGesture.bind(messageHandler, 'click', this.view),
      [Message.SWIPE]: handleGesture.bind(messageHandler, 'swipe', this.view),
      [Message.TRANSFORM]: handleGesture.bind(messageHandler, 'transform', this.view),
      [Message.RESIZE]: this.resize.bind(this),
      [Message.TRACK]: (data) => messageHandler.track(data, this.view),

      // Multi-device gesture related
      [Message.POINTER]: this.pointerEvent.bind(this),
      [Message.BLUR]: () => this.view.group.clearInputsFromView(this.view.id),

      [Message.DISPATCH]: (data) => {
        this.application.emit(data.action, { ...data.payload, view: this.view });
      },
    };

    Object.entries(listeners).forEach(([p, v]) => this.socket.on(p, v));
  }

  /**
   * Serialize the state of the application.
   *
   * @returns {object} The state of the application.
   */
  toJSON() {
    return {
      settings: this.application.settings,
      views: this.viewspace.toJSON(),
      items: this.application.workspace.toJSON(),
      viewId: this.view.id,
    };
  }

  /**
   * Inform the client on the current state of the model.
   *
   * @alias [@@fullStateReport]
   * @memberof module:server.ServerController
   */
  [symbols.fullStateReport]() {
    this.socket.emit(Message.INITIALIZE, this);
  }

  /**
   * Informs the model of the necessary changes when a client disconnects.
   *
   * @returns {boolean} true if disconnection was successful, false otherwise.
   */
  disconnect() {
    this.viewspace.removeView(this.view);
    this.view.releaseLockedItem();
    this.socket.disconnect(true);
    this.application.emit('disconnect', {
      view: this.view,
      device: this.device,
    });
    return true;
  }

  /**
   * Adjusts the model to accurately reflect the state of the client once it has
   * set itself up, and informs all other views of these changes. Also triggers
   * a 'connect handler' if one has been registered.
   *
   * @param {module:shared.View} data - Data from the client describing the
   *       state of the window in which it is displayed.
   */
  layout({ width, height }) {
    this.setSize(width, height);
    this.application.emit('connect', {
      view: this.view,
      device: this.device,
    });
    this.socket.broadcast.emit(Message.ADD_SHADOW, this.view);
    this.socket.emit(Message.UD_VIEW, this.view);
  }

  /**
   * Forwards a PointerEvent to the gesture controller.
   *
   * @param {PointerEvent} event - The event to forward.
   */
  pointerEvent(event) {
    event.target = this.view.group;
    event.view = this.view;
    event.source = this.view.id;
    event.pointerId = `${String(this.view.id)}-${event.pointerId}`;
    const { x, y } = this.device.transformPoint(event.clientX, event.clientY);
    event.clientX = x;
    event.clientY = y;
    event.x = x;
    event.y = y;
    this.view.emit(event.type, event);
    if (this.application.settings.useMultiScreenGestures) {
      this.view.group.gestureController.process(event);
    }
  }

  /**
   * Updates the model and informs all other views when a user resizes their
   * window.
   *
   * @param {module:shared.View} data - Data from the client describing the
   *       state of the window in which it is displayed.
   */
  resize({ width, height }) {
    this.setSize(width, height);
    this.socket.broadcast.emit(Message.UD_SHADOW, this.view);
  }

  /**
   * Sets the size of the view and device.
   *
   * @param {number} width
   * @param {number} height
   */
  setSize(width, height) {
    Object.assign(this.view, { width, height });
    Object.assign(this.device, { width, height });
  }
}

module.exports = ServerController;
