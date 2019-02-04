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

// Symbols to mark these methods as intended for internal use only.
const symbols = Object.freeze({
  attachListeners: Symbol('attachListeners'),
  fullStateReport: Symbol('fullStateReport'),
});

/**
 * A Connection maintains a socket.io connection between a client and the
 * server. It tracks a view associated with the client, as well as the
 * associated workspace.
 *
 * @memberof module:server
 */
class Connection {
  /**
   * @param {number} index - The index of this Connection in the workspace, can
   * be used as a unique identifier.
   * @param {Socket} socket - A socket.io connection with a client.
   * @param {module:server.WorkSpace} workspace - The workspace associated with
   * this connection.
   */
  constructor(index, socket, workspace) {
    /**
     * The index is an integer identifying the Connection, which can also be
     * used for locating the Connection in a collection.
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
     * The view corresponding to the client on the other end of this Connection.
     *
     * @type {module:server.ServerView}
     */
    this.view = this.workspace.spawnView();

    // Automatically begin operations by registering Message listeners and
    // Informing the client on the current state of the model.
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
      [Message.ADD_ITEM]:   NOP,
      [Message.ADD_SHADOW]: NOP,
      [Message.RM_ITEM]:    NOP,
      [Message.RM_SHADOW]:  NOP,
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
      [Message.RESIZE]: (data)     => this.resize(data),
      [Message.TRACK]:  ({ data }) => this.track(data),
    };

    Object.entries(listeners).forEach( ([p, v]) => this.socket.on(p, v) );
  }

  /**
   * Inform the client on the current state of the model.
   */
  [symbols.fullStateReport]() {
    const fsreport = new FullStateReporter({
      views: this.workspace.reportViews(),
      items: this.workspace.reportItems(),
      color: this.workspace.settings.color,
      id: this.view.id,
    });
    new Message(Message.INITIALIZE, fsreport).emitWith(this.socket);
  }

  /**
   * Informs the model of the necessary changes when a client disconnects.
   *
   * @returns {boolean} true if disconnection was successful, false otherwise.
   */
  disconnect() {
    if (this.workspace.removeView(this.view)) {
      this.view.releaseLockedItem();
      this.socket.disconnect(true);
      return true;
    } 
    return false;
  }

  /**
   * Forwards a message to the WorkSpace.
   *
   * @param {string} message - A string giving the type of message.
   * @param {Object} data - Argument to be passed to the message handler.
   */
  handle(message, data) {
    this.workspace.handle(message, this.view, data);
  }

  /**
   * Adjusts the model to accurately reflect the state of the client once it has
   * set itself up, and informs all other views of these changes. Also triggers
   * a 'layout handler' if one has been registered.
   *
   * @param {module:shared.View} data - Data from the client describing the
   *       state of the window in which it is displayed.
   */
  layout(data) {
    this.view.assign(data);
    this.workspace.handle('layout', this.view, this.index);
    new Message(Message.ADD_SHADOW, this.view).emitWith(this.socket.broadcast);
    new Message(Message.UD_VIEW,    this.view).emitWith(this.socket);
  }

  /**
   * Updates the model and informs all other views when a user resizes their
   * window.
   *
   * @param {module:shared.View} data - Data from the client describing the
   *       state of the window in which it is displayed.
   */
  resize(data) {
    this.view.assign(data);
    new Message(Message.UD_SHADOW, this.view).emitWith(this.socket.broadcast);
  }

  /**
   * Performs locking and unlocking based on the phase and number of active
   * points.
   *
   * @param {TrackData} data
   * @param {module:server.Point2D[]} data.active - Currently active contact
   * points.  
   * @param {module:server.Point2D} centroid - Centroid of active contact
   * points.
   * @param {string} phase - 'start', 'move', or 'end', the gesture phase.
   */
  track({ active, centroid, phase }) {
    if (phase === 'start' && active.length === 1) {
      this.workspace.giveLock(centroid.x, centroid.y, this.view);
    } else if (phase === 'end' && active.length === 0) {
      this.workspace.removeLock(this.view);
    }
  }
}

module.exports = Connection;

