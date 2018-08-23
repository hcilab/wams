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
  constructor(settings = {}) {
    this[server] = new Server(settings);
  }

  listen(port, host) {
    this[server].listen(port, host);
  }

  on(event, handler) {
    this[server].on(event, handler);
  }

  removeItem(item) {
    this[server].removeItem(item);
  }

  spawnItem(values) {
    this[server].spawnItem(values);
  }

  update(object) {
    this[server].update(object);
  }
}

module.exports = Wams;

