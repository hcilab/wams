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

// Local project packages, shared between client and server.
const { Message } = require('../shared.js');

// Symbols to mark these methods as intended for internal use only.
const symbols = Object.freeze({
  attachListeners: Symbol('attachListeners'),
});

/**
 * Report information about the given connection to the console.
 *
 * @inner
 * @memberof module:server.Switchboard
 * @param {boolean} status - True if this is a new connection, False if this is
 * a disconnection.
 */
function logConnection(status) {
  // DISABLE LOGGING DUE TO BUGS
  // FROM USING ROOT NAMESPACE
  return;
  const event = status ? 'connected' : 'disconnected';
  console.info('Tracker', event, 'to workspace.');
}

/**
 * A Switchboard handles the core server operations of a Wams program, including
 * server establishment, and establishing connections when new clients connect
 * to the server, as well as tracking the workspace associated with the server
 * so that connections can be linked to the workspace.
 *
 * @memberof module:server
 *
 * @param {module:server.WorkSpace} workspace - The workspace associated with
 * this connection.
 * @param {module:server.MessageHandler} messageHandler - For responding to
 * messages from clients.
 * @param {Namespace} namespace - Socket.io namespace for publishing changes.
 * @param {Object} settings - User-supplied options, specifying a client limit
 * and workspace settings.
 */
class TrackingSwitchboard {
  constructor(workspace, messageHandler, namespace, group, settings = {}) {
    /**
     * The number of active clients that are allowed at any given time.
     *
     * @type {number}
     */
    this.clientLimit = settings.clientLimit || TrackingSwitchboard.DEFAULTS.clientLimit;

    /**
     * The principle workspace for this server.
     *
     * @type {module:server.WorkSpace}
     */
    this.workspace = workspace;

    /**
     * The Message handler for responding to messages.
     *
     * @type {module:server.MessageHandler}
     */
    this.messageHandler = messageHandler;

    /**
     * Track the active group.
     *
     * @type {module:server.ServerViewGroup}
     */
    this.group = group;

    /**
     * Socket.io namespace in which to operate.
     *
     * @type {Namespace}
     */
    this.namespace = namespace;

    // Automatically register a connection handler with the socket.io namespace.
    this.namespace.on('connect', this.connect.bind(this));
  }

  /**
   * Attaches listeners to the socket. Only listens to message types existing on
   * the Message class object.
   *
   * @alias [@@attachListeners]
   * @memberof module:server.ServerController
   */
  [symbols.attachListeners](socket) {
    const listeners = {
      [Message.DISPATCH]: ({ data }) => {
        this.messageHandler.handleCustomEvent(data.action, data.payload);
      },
    };

    Object.entries(listeners).forEach(([p, v]) => socket.on(p, v));
  }

  /**
   * Accept the connection associated with the given socket.
   *
   * @param {Socket} socket - socket.io socket instance for the new accepted
   * connection.
   */
  accept(socket) {
    this[symbols.attachListeners](socket)
    socket.on('disconnect', () => this.disconnect());
    logConnection(true);
  }

  /**
   * Respond to a new socket.io connection.
   *
   * @param {Socket} socket - socket.io socket instance for the new connection.
   */
  connect(socket) {
    this.namespace.clients((error, clients) => {
      if (error) throw error;
      this.accept(socket);
    });
  }

  /**
   * Disconnect the given connection.
   *
   */
  disconnect() {
    logConnection(false);
  }
}

/**
 * The default values for the Switchboard.
 *
 * @type {object}
 */
TrackingSwitchboard.DEFAULTS = Object.freeze({
  clientLimit: 1000,
  port: 9000,
});

module.exports = TrackingSwitchboard;

