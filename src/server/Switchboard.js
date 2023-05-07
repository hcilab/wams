'use strict';

// Local project packages, shared between client and server.
const { Message } = require('../shared.js');

// Local project packages for the server.
const ServerController = require('./ServerController.js');

/**
 * Finds the first null or undefined index in the given array, and returns that
 * index. If all items in the array are defined and non-null, returns the length
 * of the array. JavaScript arrays allow arbitrary insertion, so in this case
 * the length of the array _is_ the first empty index!
 *
 * @inner
 * @memberof module:server.Switchboard
 *
 * @param {Array} array - The array to search.
 *
 * @return {number} The first empty index in the array.
 */
function findEmptyIndex(array) {
  /*
   * This is a very deliberate use of '==' instead of '==='. It should catch
   * both undefined and null.
   */
  const index = array.findIndex((e) => e == null);
  return index < 0 ? array.length : index;
}

/**
 * Report information about the given connection to the console.
 *
 * @inner
 * @memberof module:server.Switchboard
 * @param {number} id - ID of the view corresponding to the connection.
 * @param {number} port - Port on which the workspace is listening for the
 * connection.
 * @param {boolean} status - True if this is a new connection, False if this is
 * a disconnection.
 */
function logConnection(id, status) {
  const event = status ? 'connected' : 'disconnected';
  console.info('View', id, event, 'to workspace.');
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
class Switchboard {
  constructor(workspace, messageHandler, namespace, group, settings = {}) {
    /**
     * The number of active clients that are allowed at any given time.
     *
     * @type {number}
     */
    this.clientLimit = settings.clientLimit || Switchboard.DEFAULTS.clientLimit;

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
     * Socket.io namespace in which to operate.
     *
     * @type {Namespace}
     */
    this.namespace = namespace;

    /**
     * Tracks all active connections. Will pack new connections into the start
     * of this array at all times. Old connections will not have their position
     * in the array changed.
     *
     * @type {module:server.ServerController[]}
     */
    this.connections = [];

    /**
     * Track the active group.
     *
     * @type {module:server.ServerViewGroup}
     */
    this.group = group;

    // Automatically register a connection handler with the socket.io namespace.
    this.namespace.on('connect', this.connect.bind(this));
  }

  /**
   * Accept the connection associated with the given socket.
   *
   * @param {Socket} socket - socket.io socket instance for the new accepted
   * connection.
   */
  accept(socket) {
    const index = findEmptyIndex(this.connections);
    const controller = new ServerController(index, socket, this.workspace, this.messageHandler, this.group);

    this.connections[index] = controller;
    socket.on('disconnect', () => this.disconnect(controller));

    logConnection(controller.view.id, true);
    console.log('connected:', socket);
  }

  /**
   * Respond to a new socket.io connection.
   *
   * @param {Socket} socket - socket.io socket instance for the new connection.
   */
  connect(socket) {
    console.log(this.namespace.sockets.size);
    if (this.namespace.sockets.size <= this.clientLimit) {
      this.accept(socket);
    } else {
      this.reject(socket);
    }
  }

  /**
   * Disconnect the given connection.
   *
   * @param {ServerController} connection - ServerController to disconnect.
   */
  disconnect(controller) {
    if (controller.disconnect()) {
      this.connections[controller.index] = null;
      new Message(Message.RM_SHADOW, controller.view).emitWith(this.namespace);
      logConnection(controller.view.id, false);
    } else {
      console.error('Failed to disconnect:', this);
    }
  }

  /**
   * Reject the connection associated with the given socket.
   *
   * @param {Socket} socket - socket.io socket instance for the rejected
   * connection.
   */
  reject(socket) {
    socket.emit(Message.FULL);
    socket.disconnect(true);
    console.warn('Rejected incoming connection: client limit reached.');
  }
}

/**
 * The default values for the Switchboard.
 *
 * @type {object}
 */
Switchboard.DEFAULTS = Object.freeze({
  clientLimit: 1000,
  port: 9000,
});

module.exports = Switchboard;
