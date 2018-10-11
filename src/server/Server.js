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
const RequestHandler = require('./RequestHandler.js');
const ServerItem = require('./ServerItem.js');
const ServerView = require('./ServerView.js');
const WorkSpace = require('./WorkSpace.js');

// local constant data 
const DEFAULTS = { clientLimit: 10 };
const PORT = 9000;

function findEmptyIndex(array) {
  // This is a very deliberate use of '==' instead of '==='. It should catch
  // both undefined and null.
  const index = array.findIndex( e => e == undefined );
  return index < 0 ? array.length : index;
}

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

function logConnection(id, port, status) {
  const event = status ? 'connected' : 'disconnected';
  console.log( 'View', id, event, 'to workspace listening on port', port );
}

class Server {
  constructor(settings = {}) {
    this.clientLimit = settings.clientLimit || DEFAULTS.clientLimit;
    this.workspace = new WorkSpace(settings);
    this.server = http.createServer(new RequestHandler());
    this.port = null;
    this.io = IO(this.server);
    this.namespace = this.io.of(globals.NS_WAMS);
    this.namespace.on('connect', this.connect.bind(this));
    this.connections = [];
  }

  accept(socket) {
    const index = findEmptyIndex(this.connections);
    const cn = new Connection(index, socket, this.workspace);

    this.connections[index] = cn;
    socket.on('disconnect', () => this.disconnect(cn) );

    logConnection(cn.view.id, this.port, true);
  }

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

  disconnect(cn) {
    if (cn.disconnect()) {
      this.connections[cn.index] = undefined;
      new Message(Message.RM_SHADOW, cn.view).emitWith(this.namespace);
      logConnection(cn.view.id, this.port, false);
    } else {
      console.error('Failed to disconnect:', this);
    }
  }

  reject(socket) {
    socket.emit(Message.FULL);
    socket.disconnect(true);
    console.log('Rejected incoming connection: client limit reached.');
  }

  listen(port = PORT, host = getLocalIP()) {
    this.server.listen(port, host, () => {
      console.log('Listening on', this.server.address());
    });
    this.port = port;
  }

  on(event, handler) {
    this.workspace.on(event, handler);
  }

  removeItem(item) {
    if (this.workspace.removeItem(item)) {
      new Message(Message.RM_ITEM, item).emitWith(this.namespace);
    }
  }

  spawnItem(itemdata) {
    const item = this.workspace.spawnItem(itemdata);
    new Message(Message.ADD_ITEM, item).emitWith(this.namespace);
    return item;
  }

  update(object) {
    if (object instanceof ServerItem) {
      this.updateItem(object);
    } else if (object instanceof ServerView) {
      this.updateView(object);
    }
  }

  updateItem(item) {
    new Message(Message.UD_ITEM, item).emitWith(this.namespace);
  }

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

