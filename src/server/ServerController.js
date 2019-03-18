/*
 * WAMS - An API for Multi-Surface Environments
 *
 * Author: Michael van der Kamp
 *  |-> Date: July/August 2018
 *
 * Original author: Jesse Rolheiser
 * Other revisions and supervision: Scott Bateman
 */

'use strict';

const { FullStateReporter, Message, NOP } = require('../shared.js');
const Device = require('./Device.js');

// Symbols to mark these methods as intended for internal use only.
const symbols = Object.freeze({
  attachListeners: Symbol('attachListeners'),
  fullStateReport: Symbol('fullStateReport'),
});

/**
 * A ServerController maintains a socket.io connection between a client and the
 * server. It tracks a view associated with the client, as well as the
 * associated workspace.
 *
 * @memberof module:server
 */
class ServerController {
  /**
   * @param {number} index - The index of this ServerController in the
   * workspace, can be used as a unique identifier.
   * @param {Socket} socket - A socket.io connection with a client.
   * @param {module:server.WorkSpace} workspace - The workspace associated with
   * this connection.
   * @param {module:server.MessageHandler} messageHandler - For responding to
   * messages from clients.
   * @param {module:server.ServerViewGroup} group - The group to which this
   * connection will belong.
   */
  constructor(index, socket, workspace, messageHandler, group) {
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
     * This is a shared reference to the single principle WorkSpace. Think of it
     * like a 'parent' reference in a tree node.
     *
     * @type {module:server.WorkSpace}
     */
    this.workspace = workspace;

    /**
     * Responds to messages from clients.
     *
     * @type {module:server.MessageHandler}
     */
    this.messageHandler = messageHandler;

    /**
     * Track the group to which this connection belongs.
     *
     * @type {module:server.ServerViewGroup}
     */
    this.group = group;

    /**
     * The view corresponding to the client on the other end of this
     * ServerController.
     *
     * @type {module:server.ServerView}
     */
    this.view = this.group.spawnView(this.socket);

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
    this[symbols.attachListeners]();
    this[symbols.fullStateReport]();
  }

  /**
   * Attaches listeners to the socket. Only listens to message types existing on
   * the Message class object.
   */
  [symbols.attachListeners]() {
    const listeners = {
      // For the server to inform about changes to the model
      [Message.ADD_IMAGE]:  NOP,
      [Message.ADD_ITEM]:   NOP,
      [Message.ADD_SHADOW]: NOP,
      [Message.RM_ITEM]:    NOP,
      [Message.RM_SHADOW]:  NOP,
      [Message.SET_IMAGE]:  NOP,
      [Message.SET_RENDER]: NOP,
      [Message.UD_ITEM]:    NOP,
      [Message.UD_SHADOW]:  NOP,
      [Message.UD_VIEW]:    NOP,

      // Connection establishment related (disconnect, initial setup)
      [Message.INITIALIZE]: NOP,
      [Message.LAYOUT]:     (...args) => this.layout(...args),

      // User event related, pass off to WorkSpace to handle
      [Message.CLICK]:  ({ data }) => this.handle('click',  data),
      [Message.DRAG]:   ({ data }) => this.handle('drag',   data),
      [Message.ROTATE]: ({ data }) => this.handle('rotate', data),
      [Message.SCALE]:  ({ data }) => this.handle('scale',  data),
      [Message.SWIPE]:  ({ data }) => this.handle('swipe',  data),

      // User event related, handle immediately
      [Message.RESIZE]:  (data)     => this.resize(data),
      [Message.TRACK]:   ({ data }) => {
        this.messageHandler.track(data, this.view);
      },

      // Multi-device gesture related
      [Message.POINTER]: (event) => this.pointerEvent(event),
      [Message.BLUR]:    () => {
        this.group.clearInputsFromView(this.view.id);
      },
    };

    Object.entries(listeners).forEach(([p, v]) => this.socket.on(p, v));
  }

  /**
   * Inform the client on the current state of the model.
   */
  [symbols.fullStateReport]() {
    const fsreport = new FullStateReporter({
      ...this.workspace.settings,
      views: this.group.reportViews(),
      items: this.workspace.reportItems(),
      id:    this.view.id,
    });
    new Message(Message.INITIALIZE, fsreport).emitWith(this.socket);
  }

  /**
   * Informs the model of the necessary changes when a client disconnects.
   *
   * @returns {boolean} true if disconnection was successful, false otherwise.
   */
  disconnect() {
    this.group.removeView(this.view);
    this.view.releaseLockedItem();
    this.socket.disconnect(true);
    return true;
  }

  /**
   * Forwards a message to the WorkSpace.
   *
   * @param {string} message - A string giving the type of message.
   * @param {Object} data - Argument to be passed to the message handler.
   */
  handle(message, data) {
    this.messageHandler.handle(message, this.view, data);
  }

  /**
   * Adjusts the model to accurately reflect the state of the client once it has
   * set itself up, and informs all other views of these changes. Also triggers
   * a 'layout handler' if one has been registered.
   *
   * @param {module:shared.View} data - Data from the client describing the
   *       state of the window in which it is displayed.
   */
  layout({ width, height }) {
    this.setSize(width, height);
    this.messageHandler.handle('layout', this.view, this.index, this.device);
    new Message(Message.ADD_SHADOW, this.view).emitWith(this.socket.broadcast);
    new Message(Message.UD_VIEW,    this.view).emitWith(this.socket);
  }

  /**
   * Forwards a PointerEvent to the gesture controller.
   *
   * @param {TouchEvent} event - The event to forward.
   */
  pointerEvent(event) {
    event.source = this.view.id;
    event.changedTouches.forEach(touch => {
      touch.identifier = `${String(this.view.id)}-${touch.identifier}`;
      const { x, y } = this.device.transformPoint(touch.clientX, touch.clientY);
      touch.clientX = x;
      touch.clientY = y;
    });
    this.group.gestureController.process(event);
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
    new Message(Message.UD_SHADOW, this.view).emitWith(this.socket.broadcast);
  }

  /**
   * Sets the size of the view and device.
   *
   * @param {number} width
   * @param {number} height
   */
  setSize(width, height) {
    this.view.assign({ width, height });
    this.device.assign({ width, height });
  }
}

module.exports = ServerController;

