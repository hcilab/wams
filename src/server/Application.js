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

// External modules
const http = require('http');
const os = require('os');
const IO = require('socket.io');

// Local classes, etc
const { constants } = require('../shared.js');
const Router = require('./Router.js');
const Server = require('./Server.js');
const WorkSpace = require('./WorkSpace.js');
const MessageHandler = require('./MessageHandler.js');
const Publisher = require('./Publisher.js');

// Symbols to mark fields for local use.
const server = Symbol('server');
const workspace = Symbol('workspace');
const messageHandler = Symbol('messageHandler');

/**
 * @inner
 * @memberof module:server.Application
 *
 * @returns {string} The first valid local IPv4 address it finds.
 */
function getLocalIP() {
  let ipaddr = null;
  Object.values(os.networkInterfaces()).some(f => {
    return f.some(a => {
      if (a.family === 'IPv4' && a.internal === false) {
        ipaddr = a.address;
        return true;
      }
      return false;
    });
  });
  return ipaddr;
}

/**
 * This module defines the API endpoint. In practice, this means it is a thin
 * wrapper around the Server class which exposes only that functionality of the
 * Server which should be available to the end user. But calling it the
 * "Application" makes it sound more important.
 *
 * @memberof module:server
 */
class Application {
  /**
   * @param {object} [settings={}] - Settings data to be forwarded to the
   * server.
   * @param {module:server.Router} [router=Router()] - Route handler to use.
   */
  constructor(settings = {}, router = Router()) {
    /**
     * HTTP server for sending and receiving data.
     *
     * @type {http.Server}
     */
    this.server = http.createServer(router);

    /**
     * Socket.io namespace in which to operate.
     *
     * @type {Namespace}
     * @see {@link https://socket.io/docs/server-api/}
     */
    this.namespace = IO(this.server).of(constants.NS_WAMS);

    /**
     * Handles operations related to publishing object updates.
     *
     * @type {module:server.Publisher}
     */
    this.publisher = new Publisher();

    /**
     * The main model. The buck stops here.
     *
     * @type {module:server.WorkSpace}
     */
    this[workspace] = new WorkSpace(settings, this.namespace);

    /**
     * The MessageHandler responds to messages.
     *
     * @type {module:server.MessageHandler}
     */
    this[messageHandler] = new MessageHandler(this[workspace]);

    /**
     * The server allows communication with clients
     *
     * @type {module:server.Server}
     */
    this[server] = new Server(
      this[workspace],
      this[messageHandler],
      this.namespace,
      settings,
    );
  }

  /**
   * Start the server on the given hostname and port.
   *
   * @param {number} [port=9000] - Valid port number on which to listen.
   * @param {string} [host=getLocalIP()] - IP address or hostname on which to
   * listen.
   * @see module:server.Application~getLocalIP
   */
  listen(port = Server.DEFAULTS.port, host = getLocalIP()) {
    this.server.listen(port, host, () => {
      console.info('Listening on', this.server.address());
    });
  }

  /**
   * Register a handler for the given event.
   *
   * @param {string} event - Event to respond to.
   * @param {function} handler - Function for responding to the given event.
   */
  on(event, handler) {
    this[messageHandler].on(event, handler);
  }

  /**
   * Remove the given item from the workspace.
   *
   * @param {module:server.ServerItem} item - Item to remove.
   */
  removeItem(item) {
    this[workspace].removeItem(item);
  }

  /**
   * Spawn a new item with the given values in the workspace.
   *
   * @param {Object} itemdata - Data describing the item to spawn.
   * @return {module:server.ServerItem} The newly spawned item.
   */
  spawnItem(values) {
    return this[workspace].spawnItem(values);
  }

  /**
   * Schedules an update announcement at the next update interval.
   *
   * @param {( module:server.ServerItem | module:server.ServerView )} object -
   * Item or view that has been updated.
   */
  scheduleUpdate(object) {
    // this[server].scheduleUpdate(object);
    this.publisher.schedule(object);
  }
}

module.exports = Application;

