/*
 * WAMS - An API for Multi-Surface Environments
 *
 * Author: Michael van der Kamp
 *  |-> Date: July/August 2018
 *
 * Original author: Jesse Rolheiser
 * Other revisions and supervision: Scott Bateman
 *
 * A WamsServer handles the core server operations of a Wams program, including
 * server establishment, and establishing Connections when new clients connect
 * to the server, as well as tracking the workspace associated with the server
 * so that Connections can be linked to the workspace.
 */

'use strict';

// Node packages
const http = require('http');
const os = require('os');

// npm packages.
const IO = require('socket.io');

// local project packages.
const { constants: globals, Message } = require('../shared.js');
const Connection = require('./Connection.js');
const Router = require('./Router.js');
const ServerItem = require('./ServerItem.js');
const ServerView = require('./ServerView.js');
const WorkSpace = require('./WorkSpace.js');

// local constant data 
const DEFAULTS = { clientLimit: 10 };
const PORT = 9000;

/**
 * Finds the first null or undefined index in the given array, and returns that
 * index. If all items in the array are defined and non-null, returns the length
 * of the array. JavaScript arrays allow arbitrary insertion, so in this case
 * the length of the array _is_ the first empty index!
 *
 * array: The array to search.
 */
function findEmptyIndex(array) {
  // This is a very deliberate use of '==' instead of '==='. It should catch
  // both undefined and null.
  const index = array.findIndex( e => e == undefined );
  return index < 0 ? array.length : index;
}

/**
 * Returns the first valid local IPv4 address.
 */
function getLocalIP() {
  let ipaddr = null;
  Object.values(os.networkInterfaces()).some( f => {
    return f.some( a => {
      if (a.family === 'IPv4' && a.internal === false) {
        ipaddr = a.address;
        return true;
      }
      return false;
    });
  });
  return ipaddr;
};

/**
 * Report information about the given connection to the console.
 *
 * id    : ID of the view corresponding to the connection.
 * port  : Port on which the workspace is listening for the connection.
 * status: True if this is a new connection, False if this is a disconnection.
 */
function logConnection(id, port, status) {
  const event = status ? 'connected' : 'disconnected';
  console.log( 'View', id, event, 'to workspace listening on port', port );
}

class Server {
  /**
   * settings: User-supplied options, specifying a client limit and workspace
   *           settings.
   */
  constructor(settings = {}, router = new Router()) {
    /**
     * The number of active clients that are allowed at any given time.
     */
    this.clientLimit = settings.clientLimit || DEFAULTS.clientLimit;
    
    /**
     * The principle workspace for this server.
     */
    this.workspace = new WorkSpace(settings);

    /**
     * HTTP server for sending and receiving data.
     */
    this.server = http.createServer(router);
    
    /**
     * Port on which to listen.
     */
    this.port = null;

    /**
     * socket.io instance for maintaining connections with clients.
     */
    this.io = IO(this.server);

    /**
     * socket.io namespace in which to operate.
     */
    this.namespace = this.io.of(globals.NS_WAMS);

    /**
     * Tracks all active connections. Will pack new connections into the start
     * of this array at all times. Old connections will not have their position
     * in the array changed.
     */
    this.connections = [];

    // Automatically register a connection handler with the socket.io namespace.
    this.namespace.on('connect', this.connect.bind(this));
  }

  /**
   * Accept the connection associated with the given socket.
   *
   * socket: socket.io socket instance for the new accepted connection.
   */
  accept(socket) {
    const index = findEmptyIndex(this.connections);
    const cn = new Connection(index, socket, this.workspace);

    this.connections[index] = cn;
    socket.on('disconnect', () => this.disconnect(cn) );

    logConnection(cn.view.id, this.port, true);
  }

  /**
   * Respond to a new socket.io connection.
   *
   * socket: socket.io socket instance for the new connection.
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
   * cn: Connection to disconnect.
   */
  disconnect(cn) {
    if (cn.disconnect()) {
      this.connections[cn.index] = undefined;
      new Message(Message.RM_SHADOW, cn.view).emitWith(this.namespace);
      logConnection(cn.view.id, this.port, false);
    } else {
      console.error('Failed to disconnect:', this);
    }
  }

  /**
   * Reject the connection associated with the given socket.
   *
   * socket: socket.io socket instance for the rejected connection.
   */
  reject(socket) {
    socket.emit(Message.FULL);
    socket.disconnect(true);
    console.log('Rejected incoming connection: client limit reached.');
  }

  /**
   * Start the server on the given hostname and port.
   *
   * port: Valid port number on which to listen.
   * host: IP address or hostname on which to listen.
   */
  listen(port = PORT, host = getLocalIP()) {
    this.server.listen(port, host, () => {
      console.log('Listening on', this.server.address());
    });
    this.port = port;
  }

  /**
   * Register a handler for the given event.
   *
   * event  : Event to respond to.
   * handler: Function for responding to the given event.
   */
  on(event, handler) {
    this.workspace.on(event, handler);
  }

  /**
   * Remove the item from the model.
   *
   * item: Item to remove.
   */
  removeItem(item) {
    if (this.workspace.removeItem(item)) {
      new Message(Message.RM_ITEM, item).emitWith(this.namespace);
    }
  }

  /**
   * Spawn a new item.
   *
   * itemdata: Data describing the item to spawn.
   */
  spawnItem(itemdata) {
    const item = this.workspace.spawnItem(itemdata);
    new Message(Message.ADD_ITEM, item).emitWith(this.namespace);
    return item;
  }

  /**
   * Announce to all active clients that the given object has been updated.
   *
   * object: ServerItem or ServerView that has been updated.
   */
  update(object) {
    if (object instanceof ServerItem) {
      this.updateItem(object);
    } else if (object instanceof ServerView) {
      this.updateView(object);
    }
  }

  /**
   * Inform all clients that the given item has been updated.
   *
   * item: ServerItem that has been updated.
   */
  updateItem(item) {
    new Message(Message.UD_ITEM, item).emitWith(this.namespace);
  }

  /**
   * Inform the client corresponding to the given view that it has been updated,
   * and inform all other clients that a 'shadow' view has been updated.
   *
   * view: ServerView that has been updated.
   */
  updateView(view) {
    const cn = this.connections.find( c => c && c.view.id === view.id );
    if (cn) {
      new Message(Message.UD_SHADOW, view).emitWith(cn.socket.broadcast);
      new Message(Message.UD_VIEW,   view).emitWith(cn.socket);
    } else {
      console.warn('Failed to locate connection');
    }
  }
}

module.exports = Server;

