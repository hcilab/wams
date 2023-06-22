'use strict';

const { EventEmitter } = require('node:events');
const { Message, WamsImage } = require('../shared.js');
const { Hittable, Identifiable } = require('../mixins.js');

/**
 * HACK to get around jsdoc bug that causes mixed methods and properties to be
 * duplicated.
 *
 * @class __ServerImage
 * @private
 * @mixes module:mixins.Hittable
 * @mixes module:mixins.Identifiable
 */

/**
 * The ServerImage provides operations for the server to locate and move images
 * around.
 *
 * @memberof module:server
 * @extends module:shared.WamsImage
 * @extends __ServerImage
 *
 * @param {Namespace} namespace - Socket.io namespace for publishing changes.
 * @param {Object} values - User-supplied data detailing the image.
 */
class ServerImage extends Identifiable(Hittable(WamsImage)) {
  constructor(namespace, values = {}) {
    super(values);

    /**
     * Socket.io namespace for publishing updates.
     *
     * @type {Namespace}
     */
    this.namespace = namespace;
  }

  /*
   * Publish a general notification about the status of the image.
   */
  _emitPublication() {
    this.namespace.emit(Message.UD_ITEM, this);
  }

  /**
   * Set the image.
   *
   * @param {string} path - The path to the image for this image.
   */
  setImage(path) {
    this.src = path;
    this.namespace.emit(Message.SET_IMAGE, { id: this.id, src: path });
  }
}

Object.assign(ServerImage.prototype, EventEmitter.prototype);

module.exports = ServerImage;
