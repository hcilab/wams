/*
 * WAMS - An API for Multi-Surface Environments
 *
 * Author: Michael van der Kamp
 *  |-> Date: July/August 2018
 *
 * Original author: Jesse Rolheiser
 * Other revisions and supervision: Scott Bateman
 *
 * This module defines the API endpoint. In practice, this means it is a thin
 * wrapper around the Server class which exposes only that functionality of the
 * Server which should be available to the end user.
 */

'use strict';

const Server = require('./Server.js');
const server = Symbol('server');

class Wams {
  /**
   * settings: Settings data to be forwarded to the server.
   */
  constructor(settings = {}) {
    this[server] = new Server(settings);
  }

  /**
   * Activate the server, listening on the given host and port.
   */
  listen(port, host) {
    this[server].listen(port, host);
  }

  /**
   * Register a handler for the given event.
   */
  on(event, handler) {
    this[server].on(event, handler);
  }

  /**
   * Remove the given item from the workspace.
   */
  removeItem(item) {
    this[server].removeItem(item);
  }

  /**
   * Spawn a new item with the given values in the workspace.
   */
  spawnItem(values) {
    this[server].spawnItem(values);
  }

  /**
   * Announce an update to the given object to all clients.
   */
  update(object) {
    this[server].update(object);
  }
}

module.exports = Wams;

