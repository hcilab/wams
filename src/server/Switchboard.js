'use strict';

// Local project packages, shared between client and server.
const { Message } = require('../shared.js');

// Local project packages for the server.
const ServerController = require('./ServerController.js');
const ServerViewGroup = require('./ServerViewGroup.js');

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
 * to the server.
 *
 * @memberof module:server
 *
 * @param {module:server.Application} application - The WAMS application for
 * this handler.
 * @param {Namespace} namespace - Socket.io namespace for publishing changes.
 * @param {number} clientLimit - The number of active clients that are allowed
 */
class Switchboard {
  constructor(application, namespace, clientLimit) {
    /**
     * The number of active clients that are allowed at any given time.
     *
     * @type {number}
     */
    this.clientLimit = clientLimit;

    /**
     * The WAMS application for this handler.
     *
     * @type {module:server.Application}
     */
    this.application = application;

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
    this.group = new ServerViewGroup(this.application.messageHandler);

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
    const controller = new ServerController(
      index,
      socket,
      this.application,
      this.group
    );

    this.connections[index] = controller;
    socket.on('disconnect', () => this.disconnect(controller));

    logConnection(controller.view.id, true);
  }

  /**
   * Respond to a new socket.io connection.
   *
   * @param {Socket} socket - socket.io socket instance for the new connection.
   */
  connect(socket) {
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
      this.namespace.emit(Message.RM_SHADOW, controller.view);
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

module.exports = Switchboard;
