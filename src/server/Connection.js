/*
 * WAMS - An API for Multi-Surface Environments
 *
 * Author: Michael van der Kamp
 *  |-> Date: July/August 2018
 *
 * Original author: Jesse Rolheiser
 * Other revisions and supervision: Scott Bateman
 *
 * A Connection maintains a socket.io connection between a client and the
 * server. It tracks a view associated with the client, as well as the 
 * associated workspace.
 */

'use strict';

const { FullStateReporter, Message, NOP } = require('../shared.js');

// Symbols to mark these methods as intended for internal use only.
const symbols = Object.freeze({
  attachListeners: Symbol('attachListeners'),
  fullStateReport: Symbol('fullStateReport'),
});

class Connection {
  constructor(index, socket, workspace) {
    /**
     * The index is an integer identifying the Connection, which can also be
     * used for locating the Connection in a collection.
     */
    this.index = index;

    /**
     * The socket is a socket.io connection with a client.
     */
    this.socket = socket;

    /**
     * This is a shared reference to the single principle WorkSpace. Think of it
     * like a 'parent' reference in a tree node.
     */
    this.workspace = workspace;

    /**
     * The view corresponding to the client on the other end of this Connection.
     */
    this.view = this.workspace.spawnView();

    // Automatically begin operations by registering Message listeners and
    // informing the client on the current state of the model.
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

      // User event related
      [Message.CLICK]:  (...args) => this.handle('click', ...args),
      [Message.DRAG]:   (...args) => this.handle('drag', ...args),
      [Message.RESIZE]: (...args) => this.resize(...args),
      [Message.ROTATE]: (...args) => this.handle('rotate', ...args),
      [Message.SCALE]:  (...args) => this.handle('scale', ...args),
      [Message.SWIPE]:  (...args) => this.handle('swipe', ...args),
      [Message.TRACK]:  (...args) => this.track(...args),
    };

    Object.entries(listeners).forEach( ([p,v]) => this.socket.on(p, v) );
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
   * message: A string giving the type of message
   * ...args: Arguments to be passed to the message handler.
   */
  handle(message, ...args) {
    this.workspace.handle(message, this.view, ...args);
  }

  /**
   * Adjusts the model to accurately reflect the state of the client once it has
   * set itself up, and informs all other views of these changes. Also triggers
   * a 'layout handler' if one has been registered.
   *
   * data: Data from the client describing the state of the window in which it
   *       is displayed.
   */
  layout(data) {
    this.view.assign(data);
    new Message(Message.ADD_SHADOW, this.view).emitWith(this.socket.broadcast);
    this.workspace.handle('layout', this.view, this.index);
  }

  /**
   * Updates the model and informs all other views when a user resizes their
   * window.
   *
   * data: Data from the client describing the state of the window in which it
   *       is displayed.
   */
  resize(data) {
    this.view.assign(data);
    new Message(Message.UD_SHADOW, this.view).emitWith(this.socket.broadcast);
  }

  /**
   * Performs locking and unlocking based on the phase.
   */
  track({ x, y, phase }) {
    if (phase === 'start') {
      this.workspace.giveLock(x, y, this.view);
    } else if (phase === 'end') {
      this.workspace.removeLock(this.view);
    }
  }
}

module.exports = Connection;

