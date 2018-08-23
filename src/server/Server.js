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

const http = require('http');
const IO = require('socket.io');
const os = require('os');
const { constants: globals, Message } = require('../shared.js');
const Connection = require('./Connection.js');
const RequestHandler = require('./RequestHandler.js');
const ServerItem = require('./ServerItem.js');
const ServerView = require('./ServerView.js');
const WorkSpace = require('./WorkSpace.js');

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
  console.log(
    'View', id, event, 'to workspace listening on port', port
  );
}

const symbols = Object.freeze({
  accept:      Symbol('accept'),
  clientlimit: Symbol('clientLimit'),
  connect:     Symbol('connect'),
  connections: Symbol('connections'),
  disconnect:  Symbol('disconnect'),
  io:          Symbol('io'),
  namespace:   Symbol('namespace'),
  port:        Symbol('port'),
  reject:      Symbol('reject'),
  server:      Symbol('server'),
  workspace:   Symbol('workspace'),
});

class WamsServer {
  constructor(settings = {}) {
    this[symbols.clientLimit] = settings.clientLimit || DEFAULTS.clientLimit;
    this[symbols.workspace] = new WorkSpace(settings);
    this[symbols.server] = http.createServer(new RequestHandler());
    this[symbols.port] = null;
    this[symbols.io] = IO(this[symbols.server]);
    this[symbols.namespace] = this[symbols.io].of(globals.NS_WAMS);
    this[symbols.namespace].on('connect', this[symbols.connect].bind(this));

    /*
     * FIXME: Not necessary to actually track connections like this, doing it
     *      for debugging assistance, for now.
     * XXX: Actuallly, I am using them right now, in updateView().
     */
    this[symbols.connections] = [];
  }

  [symbols.accept](socket) {
    const index = findEmptyIndex(this[symbols.connections]);
    const cn = new Connection(index, socket, this[symbols.workspace]);

    this[symbols.connections][index] = cn;
    socket.on('disconnect', () => this[symbols.disconnect](cn) );

    logConnection(cn.view.id, this[symbols.port], true);
  }

  [symbols.connect](socket) {
    this[symbols.io].of(globals.NS_WAMS).clients((error, clients) => {
      if (error) throw error;
      if (clients.length <= this[symbols.clientLimit]) {
        this[symbols.accept](socket);
      } else {
        this[symbols.reject](socket);
      }
    });
  }

  [symbols.disconnect](cn) {
    if (cn.disconnect()) {
      delete this[symbols.connections][cn.index];
      new Message(Message.RM_SHADOW, cn.view).emitWith(this[symbols.namespace]);
      logConnection(cn.view.id, this[symbols.port], false);
    } else {
      console.error('Failed to disconnect:', this);
    }
  }

  [symbols.reject](socket) {
    socket.emit('wams-full');
    socket.disconnect(true);
    console.log('Rejected incoming connection: client limit reached.');
  }

  /*
   * For modularity, may want to refactor this to allow the user to have more
   * control over server establishment.
   */
  listen(port = PORT, host = getLocalIP()) {
    this[symbols.server].listen(port, host, () => {
      console.log('Listening on', this[symbols.server].address());
    });
    this[symbols.port] = port;
  }

  on(event, handler) {
    this[symbols.workspace].on(event, handler);
  }

  removeItem(item) {
    if (this[symbols.workspace].removeItem(item)) {
      new Message(Message.RM_ITEM, item).emitWith(this[symbols.namespace]);
    }
  }

  spawnItem(itemdata) {
    const item = this[symbols.workspace].spawnItem(itemdata);
    new Message(Message.ADD_ITEM, item).emitWith(this[symbols.namespace]);
    return item;
  }

  update(object, data) {
    if (object instanceof ServerItem) {
      this.updateItem(object, data);
    } else if (object instanceof ServerView) {
      this.updateView(object, data);
    }
  }

  /*
   * TODO: Improve the functionality, to make use of the functions in the
   * ServerItem and ServerView classes.
   */
  updateItem(item, data) {
    item.assign(data);
    new Message(Message.UD_ITEM, item).emitWith(this[symbols.namespace]);
  }

  updateView(view, data) {
    view.assign(data);
    const cn = this[symbols.connections].find( 
      c => c && c.view.id === view.id 
    );
    if (cn) {
      new Message(Message.UD_SHADOW, view).emitWith(cn.socket.broadcast);
      new Message(Message.UD_VIEW,   view).emitWith(cn.socket);
    } else {
      console.warn('Failed to locate connection');
    }
  }
}

module.exports = WamsServer;

