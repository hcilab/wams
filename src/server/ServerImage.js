'use strict';

const { Message, WamsImage } = require('../shared.js');
const { Hittable, Identifiable } = require('../mixins.js');

/**
 * The ServerImage provides operations for the server to locate and move images
 * around.
 *
 * @memberof module:server
 * @extends module:shared.WamsImage
 * @mixes module:mixins.Hittable
 * @mixes module:mixins.Identifiable
 *
 * @param {Namespace} namespace - Socket.io namespace for publishing changes.
 * @param {Object} values - User-supplied data detailing the image. Properties
 * on this object that line up with {@link module:shared.Image} members will be
 * stored. Any other properties will be ignored.
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

    // Notify subscribers immediately.
    new Message(Message.ADD_IMAGE, this).emitWith(this.namespace);
    if (values.src) {
      this.setImage(values.src);
    }
  }

  /*
   * Publish a general notification about the status of the image.
   */
  _emitPublication() {
    new Message(Message.UD_ITEM, this).emitWith(this.namespace);
  }

  /**
   * Set the image.
   *
   * @param {string} path - The path to the image for this image.
   */
  setImage(path) {
    this.src = path;
    new Message(Message.SET_IMAGE, { id: this.id, src: path }).emitWith(this.namespace);
  }
}

module.exports = ServerImage;
