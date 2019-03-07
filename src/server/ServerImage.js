/*
 * WAMS - An API for Multi-Surface Environments
 *
 * Author: Michael van der Kamp
 */

'use strict';

const {
  WamsImage,
  Message,
} = require('../shared.js');
const { Hittable } = require('../mixins.js');

/**
 * The ServerImage provides operations for the server to locate and move images
 * around.
 *
 * @memberof module:server
 * @extends module:shared.WamsImage
 * @mixes module:mixins.Hittable
 */
class ServerImage extends Hittable(WamsImage) {
  /**
   * @param {Namespace} namespace - Socket.io namespace for publishing changes.
   * @param {Object} values - User-supplied data detailing the image. Properties
   * on this object that line up with {@link module:shared.Image} members will
   * be stored. Any other properties will be ignored.
   */
  constructor(namespace, values = {}) {
    super({ ...ServerImage.DEFAULTS, ...values });

    /**
     * Socket.io namespace for publishing updates.
     *
     * @type {Namespace}
     */
    this.namespace = namespace;

    // Notify subscribers immediately.
    new Message(Message.ADD_ITEM, this).emitWith(this.namespace);
  }

  /*
   * Publish a general notification about the status of the image.
   */
  publish() {
    new Message(Message.UD_ITEM, this).emitWith(this.namespace);
  }

  /**
   * Set the image.
   *
   * @param {string} path - The path to the image for this image.
   */
  setImage(path) {
    this.src = path;
    this.schedulePublication();
  }
}

/**
 * The default values for a ServerImage.
 *
 * @type {Object}
 */
ServerImage.DEFAULTS = Object.freeze({
  x:         0,
  y:         0,
  width:     400,
  height:    300,
  hitbox:    null,
  rotation:  0,
  scale:     1,
  type:      'item/image',
  src:       '',
});

module.exports = ServerImage;

