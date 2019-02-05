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

const Server = require('./Server.js');

const server = Symbol('server');
const updates = Symbol('updates');

/**
 * This module defines the API endpoint. In practice, this means it is a thin
 * wrapper around the Server class which exposes only that functionality of the
 * Server which should be available to the end user.
 *
 * @memberof module:server
 */
class Wams {
  /**
   * @param {object} [settings={}] - Settings data to be forwarded to the
   * server.
   * @param {module:server.Router} [router=Router()] - Route handler to
   * use.
   */
  constructor(settings = {}, router) {
    this[server] = new Server(settings, router);
    this[updates] = {};

    setInterval(this.postUpdates.bind(this), 1000 / 60);
  }

  /**
   * Activate the server, listening on the given host and port.
   *
   * @param {number} [port=9000] - Valid port number on which to listen.
   * @param {string} [host=getLocalIP()] - IP address or hostname on which to
   * listen.
   * @see module:server.Server~getLocalIP
   */
  listen(port, host) {
    this[server].listen(port, host);
  }

  /**
   * Register a handler for the given event.
   *
   * @param {string} event - Event to respond to.
   * @param {function} handler - Function for responding to the given event.
   */
  on(event, handler) {
    this[server].on(event, handler);
  }

  /**
   * Remove the given item from the workspace.
   *
   * @param {module:server.ServerItem} item - Item to remove.
   */
  removeItem(item) {
    this[server].removeItem(item);
  }

  /**
   * Spawn a new item with the given values in the workspace.
   *
   * @param {Object} itemdata - Data describing the item to spawn.
   * @return {module:server.ServerItem} The newly spawned item.
   */
  spawnItem(values) {
    this[server].spawnItem(values);
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

  /**
   * Post scheduled updates.
   */
  postUpdates() {
    Object.values(this[updates]).forEach(o => {
      this.update(o);
      delete this[updates][o.id];
    });
  }

  /**
   * Announce an update to the given object to all clients.
   *
   * @param {( module:server.ServerItem | module:server.ServerView )} object -
   * Item or view that has been updated.
   */
  update(object) {
    this[server].update(object);
  }
}

module.exports = Wams;

