'use strict';

// External modules
const http = require('http');
const os = require('os');
const { Server } = require('socket.io');

// Local classes, etc
const { constants, DataReporter, Message } = require('../shared.js');
const Switchboard = require('./Switchboard.js');
const WorkSpace = require('./WorkSpace.js');
const MessageHandler = require('./MessageHandler.js');
const ServerViewGroup = require('./ServerViewGroup.js');
const { EventTarget } = require('../mixins.js');

/**
 * This module defines the API endpoint.
 *
 * @memberof module:server
 *
 * @param {http.Server} server
 * @param {object} [settings={}] - Settings data to be forwarded to the server.
 */
class Application extends EventTarget(Object) {
  constructor(server, settings = {}, ...args) {
    super(...args);

    /**
     * Socket.io instance using http server.
     */
    this.socket_io = new Server(server);

    /**
     * Socket.io namespace in which to operate.
     *
     * @type {Namespace}
     * @see {@link https://socket.io/docs/server-api/}
     */
    this.namespace = this.socket_io.of(constants.NS_WAMS);

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
    const dreport = new DataReporter({
      data: { action, payload },
    });
    new Message(Message.DISPATCH, dreport).emitWith(this.workspace.namespace);
  }
}

module.exports = Application;
