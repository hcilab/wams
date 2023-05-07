'use strict';

// External modules
const http = require('http');
const os = require('os');
const socket_io = require('socket.io');

// Local classes, etc
const { constants, Message } = require('../shared.js');
const Router = require('./Router.js');
const Switchboard = require('./Switchboard.js');
const WorkSpace = require('./WorkSpace.js');
const MessageHandler = require('./MessageHandler.js');
const ServerViewGroup = require('./ServerViewGroup.js');
const { EventTarget } = require('../mixins.js');

/**
 * @inner
 * @memberof module:server.Application
 *
 * @returns {string} The first valid local IPv4 address it finds.
 */
function getLocalIP() {
  let ipaddr = null;
  Object.values(os.networkInterfaces()).some((f) => {
    return f.some((a) => {
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
 * This module defines the API endpoint.
 *
 * @memberof module:server
 *
 * @param {object} [settings={}] - Settings data to be forwarded to the server.
 * @param {module:server.Router} [router=Router()] - Route handler to use.
 */
class Application extends EventTarget(Object) {
  constructor(settings = {}, router = Router(), ...args) {
    super(...args);

    this.setupStaticRoute(settings, router);

    /**
     * HTTP server for sending and receiving data.
     *
     * @type {http.Server}
     */
    this.httpServer = http.createServer(router);

    /**
     * Socket.io instance using http server.
     */
    this.io_server = new socket_io.Server(this.httpServer);

    /**
     * Socket.io namespace in which to operate.
     *
     * @type {Namespace}
     * @see {@link https://socket.io/docs/server-api/}
     */
    this.namespace = this.io_server.of(constants.NS_WAMS);

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
     * Track the active group.
     *
     * @type {module:server.ServerViewGroup}
     */
    this.group = new ServerViewGroup(this.messageHandler);

    /**
     * The switchboard allows communication with clients
     *
     * @type {module:server.Switchboard}
     */
    this.switchboard = new Switchboard(this.workspace, this.messageHandler, this.namespace, this.group, settings);
  }

  /**
   * Setup the route to the static files directory,
   * if included in application configuration.
   *
   * @param {object} settings
   * @param {module:server.Router} router
   */
  setupStaticRoute(settings, router) {
    const staticDir = settings.staticDir;
    if (staticDir) router.use(router.express.static(staticDir));
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
    this.httpServer.listen(port, host, () => {
      const formatAddress = (_host, port) => `http://${_host}:${port}`;
      const { address, port } = this.httpServer.address();

      console.log('🚀 WAMS server listening on:');
      console.log(`🔗 ${formatAddress(address, port)}`);

      // if host is localhost or '0.0.0.0', assume local ipv4 also available
      if (host === '0.0.0.0' || host == 'localhost') {
        const localIPv4 = getLocalIP();
        console.log(`🔗 ${formatAddress(localIPv4, port)}`);
      }
    });
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
    new Message(Message.DISPATCH, { action, payload }).emitWith(this.workspace.namespace);
  }
}

module.exports = Application;
