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

// Local project packages for the server.
const Connection = require('./Connection.js');
const GestureController = require('./GestureController.js');
const ServerViewGroup = require('./ServerViewGroup.js');

// Local constant data
const SIXTY_FPS = 1000 / 60;

// Symbol to mark this property for internal use.
const updates = Symbol('updates');

/**
 * Finds the first null or undefined index in the given array, and returns that
 * index. If all items in the array are defined and non-null, returns the length
 * of the array. JavaScript arrays allow arbitrary insertion, so in this case
 * the length of the array _is_ the first empty index!
 *
 * @inner
 * @memberof module:server.Server
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
  const index = array.findIndex(e => e == null);
  return index < 0 ? array.length : index;
}

/**
 * Report information about the given connection to the console.
 *
 * @inner
 * @memberof module:server.Server
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
 * A Server handles the core server operations of a Wams program, including
 * server establishment, and establishing Connections when new clients connect
 * to the server, as well as tracking the workspace associated with the server
 * so that Connections can be linked to the workspace.
 *
 * @memberof module:server
 */
class Server {
  /**
   * @param {module:server.WorkSpace} workspace - The workspace associated with
   * this connection.
   * @param {module:server.MessageHandler} messageHandler - For responding to
   * messages from clients.
   * @param {Namespace} namespace - Socket.io namespace for publishing changes.
   * @param {Object} settings - User-supplied options, specifying a client limit
   * and workspace settings.
   */
  constructor(workspace, messageHandler, namespace, settings = {}) {
    /**
     * The number of active clients that are allowed at any given time.
     *
     * @type {number}
     */
    this.clientLimit = settings.clientLimit || Server.DEFAULTS.clientLimit;

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
     * @type {module:server.Connection[]}
     */
    this.connections = [];

    /**
     * Track the active group.
     *
     * @type {module:server.ServerViewGroup}
     */
    this.group = new ServerViewGroup();

    /**
     * Controls server-side gestures.
     *
     * @type {module:server.GestureController}
     */
    this.gestureController = new GestureController(messageHandler, this.group);
    this.group.setGestureController(this.gestureController);

    /**
     * Dictionary of objects to update, keyed by id.
     *
     * @type {object}
     */
    this[updates] = {};
    setInterval(this.publishUpdates.bind(this), SIXTY_FPS);

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
    const cn = new Connection(
      index,
      socket,
      this.workspace,
      this.messageHandler,
      this.group,
      this,
    );

    this.connections[index] = cn;
    socket.on('disconnect', () => this.disconnect(cn));

    logConnection(cn.view.id, true);
  }

  /**
   * Respond to a new socket.io connection.
   *
   * @param {Socket} socket - socket.io socket instance for the new connection.
   */
  connect(socket) {
    this.namespace.clients((error, clients) => {
      if (error) throw error;
      if (clients.length <= this.clientLimit) {
        this.accept(socket);
      } else {
        this.reject(socket);
      }
    });
  }

  /**
   * Disconnect the given connection.
   *
   * @param {Connection} cn - Connection to disconnect.
   */
  disconnect(cn) {
    if (cn.disconnect()) {
      this.connections[cn.index] = null;
      new Message(Message.RM_SHADOW, cn.view).emitWith(this.namespace);
      logConnection(cn.view.id, false);
    } else {
      console.error('Failed to disconnect:', this);
    }
  }

  /**
   * Publish scheduled updates.
   */
  publishUpdates() {
    Object.values(this[updates]).forEach(o => {
      o.publish();
      delete this[updates][o.id];
    });
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

  /**
   * @return {module:shared.View[]} Reports of the currently active views.
   */
  reportViews() {
    return this.connections.filter(c => c).map(c => c.view.report());
  }

  /**
   * Schedules an update announcement at the next update interval.
   *
   * @param {( module:server.ServerItem | module:server.ServerView )} object -
   * Item or view that has been updated.
   */
  scheduleUpdate(object) {
    this[updates][object.id] = object;
  }
}

/**
 * The default values for the Server.
 *
 * @type {object}
 */
Server.DEFAULTS = Object.freeze({
  clientLimit: 10,
  port:        9000,
});

module.exports = Server;

