'use strict';

// External modules
const http = require('http');
const { EventEmitter } = require('node:events');
const os = require('os');
const socket_io = require('socket.io');

// Local classes, etc
const { constants, Message } = require('../shared.js');
const { getLocalIP, listen, router } = require('../predefined/routing.js');
const Switchboard = require('./Switchboard.js');
const WorkSpace = require('./WorkSpace.js');
const MessageHandler = require('./MessageHandler.js');

/**
 * This module defines the API endpoint.
 *
 * @memberof module:server
 *
 * @param {object} [settings={}] - Settings data to be forwarded to the server.
 * @param {express.app} [appRouter=predefined.routing.router()] - Route handler to use.
 * @param {http.Server} [server=undefined] - HTTP server to use.
 */
class Application {
  constructor(settings = {}, appRouter = router(), server = undefined) {
    /**
     * Express app for routing.
     * @type {express.app}
     * @see {@link https://expressjs.com/en/4x/api.html#app}
     */
    this.router = appRouter;

    /**
     * HTTP server for sending and receiving data.
     *
     * @type {http.Server}
     */
    if (server) {
      this.httpServer = server;
    } else {
      this.httpServer = http.createServer(this.router);
    }

    /**
     * Socket.io instance using http server.
     */
    this.ioServer = new socket_io.Server(this.httpServer);

    /**
     * Socket.io namespace in which to operate.
     *
     * @type {Namespace}
     * @see {@link https://socket.io/docs/server-api/}
     */
    this.namespace = this.ioServer.of(constants.NS_WAMS);

    /**
     * The main model. The buck stops here.
     *
     * @type {module:server.WorkSpace}
     */
    this.workspace = new WorkSpace(settings, this.namespace);

    /**
     * The MessageHandler responds to messages.
     *
     * @type {module:server.MessageHandler}
     */
    this.messageHandler = new MessageHandler(this, this.workspace);

    /**
     * The switchboard allows communication with clients
     *
     * @type {module:server.Switchboard}
     */
    this.switchboard = new Switchboard(this.workspace, this.messageHandler, this.namespace, settings);
  }

  /**
   * Start the server on the given hostname and port.
   *
   * @param {number} [port=9000] - Valid port number on which to listen.
   * @param {string} [host=getLocalIP()] - IP address or hostname on which to
   * listen.
   * @see module:server.Application~getLocalIP
   */
  listen(port = Switchboard.DEFAULTS.port, host = '0.0.0.0') {
    listen(this.httpServer, host, port);
  }

  /**
   * Remove the given item from the workspace.
   *
   * @param {module:server.ServerItem} item - Item to remove.
   */
  removeItem(item) {
    this.workspace.removeItem(item);
  }

  /**
   * Spawn a new element with the given values in the workspace.
   *
   * @param {Object} values - Data describing the element to spawn.
   * @return {module:server.ServerElement} The newly spawned element.
   */
  spawnElement(values) {
    return this.workspace.spawnElement(values);
  }

  /**
   * Spawn a new image with the given values in the workspace.
   *
   * @param {Object} values - Data describing the image to spawn.
   * @return {module:server.ServerImage} The newly spawned image.
   */
  spawnImage(values) {
    return this.workspace.spawnImage(values);
  }

  /**
   * Spawn a new item with the given values in the workspace.
   *
   * @param {Object} itemdata - Data describing the item to spawn.
   * @return {module:server.ServerItem} The newly spawned item.
   */
  spawnItem(values) {
    return this.workspace.spawnItem(values);
  }

  /**
   * Spawn an object. Object type is determined by the
   * `type` key value of the argument object.
   *
   * @param {Object} itemdata - Data describing the object to spawn.
   * @return {module:server.ServerItem} The newly spawned object.
   */
  spawn(values) {
    switch (values.type) {
      case 'item':
        return this.spawnItem(values);
      case 'item/image':
        return this.spawnImage(values);
      case 'item/element':
        return this.spawnElement(values);
      default:
        return this.spawnItem(values);
    }
  }

  /**
   * Create a group for existing items in the workspace.
   * A group allows to interact with several elements simultaneously.
   *
   * @param  {obj} values properties for the group
   */
  createGroup(values) {
    return this.workspace.createGroup(values);
  }

  /**
   * Send Message to all clients to dispatch user-defined action.
   *
   * @param {string} action name of the user-defined action.
   * @param {object} payload argument of the user-defined action function.
   */
  dispatch(action, payload) {
    this.workspace.namespace.emit(Message.DISPATCH, { action, payload });
  }
}

Object.assign(Application.prototype, EventEmitter.prototype);

module.exports = Application;
