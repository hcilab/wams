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

    // Set up the view and device to reference each other. This will be very
    // useful for layouts, etc.
    this.view.device = this.device;
    this.device.view = this.view;

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
      [Message.READY]: NOP,

      // User event related
      [Message.RESIZE]: this.resize.bind(this),

      // Gesture related
      [Message.POINTER]: this.pointerEvent.bind(this),
      [Message.BLUR]: () => this.view.group.clearInputsFromView(this.view.id),
      [Message.KEYBOARD]: this.keyboardEvent.bind(this),
      [Message.WHEEL]: this.wheelEvent.bind(this),

      // For user-defined behavior
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
      group: this.view.group,
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
      group: this.view.group,
    });
    this.socket.broadcast.emit(Message.ADD_SHADOW, this.view);
    this.socket.emit(Message.UD_VIEW, this.view);
    this.socket.emit(Message.READY);
  }

  /**
   * Forwards a PointerEvent to the gesture controller.
   *
   * @param {PointerEvent} event - The event to forward.
   */
  pointerEvent(event) {
    // Capture the original coordinates in the client's coordinate space.
    const clientPoint = { x: event.clientX, y: event.clientY };

    // For emitting pointer events on the view, we need the x/y coordinates to
    // be in the workspace's coordinate space.
    const viewPoint = this.view.transformPoint(clientPoint.x, clientPoint.y);
    event.clientX = viewPoint.x;
    event.clientY = viewPoint.y;
    event.x = viewPoint.x;
    event.y = viewPoint.y;
    event.pointerId = `${String(this.view.id)}-${event.pointerId}`;

    if (
      event.type === 'pointerdown' &&
      this.view.group.gestureController.hasNoInputs() &&
      this.view.lockedItem == null
    ) {
      this.application.workspace.obtainLock(viewPoint.x, viewPoint.y, this.view.group);
    }

    event.target = this.view.group; // needed by gesture controller
    event.view = this.view;
    event.group = this.view.group;
    event.device = this.device;

    // Emit raw pointer event
    this.view.emit(event.type, event);

    // For processing gestures, we need the x/y coordinates to be in the device's coordinate space.
    const devicePoint = this.device.transformPoint(clientPoint.x, clientPoint.y);
    event.clientX = devicePoint.x;
    event.clientY = devicePoint.y;
    event.x = devicePoint.x;
    event.y = devicePoint.y;

    // May triggered gesture events
    this.view.group.gestureController.process(event);

    if (this.view.group.gestureController.hasNoInputs()) {
      this.view.group.releaseLockedItem();
    }
  }

  /**
   * Forwards a keyboard event to the gesture controller.
   *
   * @param {KeyboardEvent} event - The event to forward.
   */
  keyboardEvent(event) {
    event.target = this.view.group;
    event.view = this.view;
    event.group = this.view.group;
    event.device = this.device;
    this.view.group.gestureController.handleKeyboardEvent(event);
  }

  /**
   * Forwards a wheel event to the message handler as a pinch event.
   *
   * @param {WheelEvent} event - The event to forward.
   */
  wheelEvent(event) {
    const { clientX, clientY, spinY } = event;
    const target = this.view.group;
    const view = this.view;
    const group = this.view.group;
    const device = this.device;
    const scale = 1 - spinY * 0.1;
    const { x, y } = this.view.transformPoint(clientX, clientY);
    this.application.messageHandler.scale({ x, y, target, view, group, device }, { scale });
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
