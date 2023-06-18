'use strict';

// External modules
const http = require('http');
const { EventEmitter } = require('node:events');
const os = require('os');
const socket_io = require('socket.io');

// Local classes, etc
const { constants, Message } = require('../shared.js');
const { addStaticDirectory, getLocalIP, listen, router } = require('../predefined/routing.js');
const Switchboard = require('./Switchboard.js');
const WorkSpace = require('./WorkSpace.js');
const MessageHandler = require('./MessageHandler.js');

/**
 * This module defines the API endpoint.
 *
 * @memberof module:server
 *
 * @param {object} [settings={}] - Settings data to be forwarded to the server.
 * @param {boolean} [settings.applySmoothing=true] - Whether to apply smoothing
 * to gesture inputs on coarse pointer devices (e.g. touch screens).
 * @param {boolean} [settings.shadows=false] - Whether to show shadows of other views.
 * @param {boolean} [settings.status=false] - Whether to show debugging status information in the view.
 * @param {boolean} [settings.useMultiScreenGestures=false] - Whether to use server-side gestures.
 * @param {string} [settings.backgroundImage=undefined] - Optional background image for canvas.
 * Not recommended. Prefer defining your own HTML, CSS, server, and routing.
 * @param {string} [settings.clientScripts=undefined] - Optional extra javascript to load in client.
 * Not recommended. Prefer defining your own HTML, CSS, server, and routing.
 * @param {string} [settings.color='gray'] Background color for the workspace.
 * Not recommended. Prefer defining your own HTML, CSS, server, and routing.
 * @param {number} [clientLimit=10] - The number of active clients that are allowed
 * Not recommended. Prefer defining your own HTML, CSS, server, and routing.
 * @param {express.app} [appRouter=predefined.routing.router()] - Route handler to use.
 * @param {http.Server} [server=http.createServer()] - HTTP server to use.
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
     * Settings for the application.
     *
     * @type {object}
     */
    this.settings = { ...Application.DEFAULTS, ...settings };

    /**
     * The main model. The buck stops here.
     *
     * @type {module:server.WorkSpace}
     */
    this.workspace = new WorkSpace(this.namespace);

    /**
     * The MessageHandler responds to messages.
     *
     * @type {module:server.MessageHandler}
     */
    this.messageHandler = new MessageHandler(this);

    /**
     * The switchboard allows communication with clients
     *
     * @type {module:server.Switchboard}
     */
    this.switchboard = new Switchboard(this, this.namespace, this.settings.clientLimit);
  }

  /**
   * Add a static route to the router.
   *
   * @memberof module:server.Application
   *
   * @param {string} staticDir - The path to the static directory to add
   */
  addStaticDirectory(staticDir) {
    addStaticDirectory(this.router, staticDir);
  }

  /**
   * Start the server on the given hostname and port.
   *
   * @memberof module:server.Application
   *
   * @param {number} [port=9000] - Valid port number on which to listen.
   * @param {string} [host=getLocalIP()] - IP address or hostname on which to
   * listen.
   * @see module:server.Application~getLocalIP
   */
  listen(port = 9000, host = '0.0.0.0') {
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
  createItemGroup(values) {
    return this.workspace.createItemGroup(values);
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

/**
 * The default values for an Application.
 *
 * @type {object}
 */
Application.DEFAULTS = Object.freeze({
  applySmoothing: true,
  backgroundImage: undefined,
  clientLimit: 10,
  clientScripts: undefined,
  color: '#dad1e3',
  shadows: false,
  status: false,
  stylesheets: undefined,
  useMultiScreenGestures: false,
});

module.exports = Application;
