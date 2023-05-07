'use strict';

const { Message, WamsElement } = require('../shared.js');
const { Hittable, Identifiable } = require('../mixins.js');

/**
 * The ServerElement provides operations for the server to locate and move
 * elements around.
 *
 * @memberof module:server
 * @extends module:shared.WamsElement
 * @mixes module:mixins.Hittable
 * @mixes module:mixins.Identifiable
 *
 * @param {Namespace} namespace - Socket.io namespace for publishing changes.
 * @param {Object} values - User-supplied data detailing the elements.
 * Properties on this object that line up with {@link module:shared.Element}
 * members will be stored. Any other properties will be ignored.
 */
class ServerElement extends Identifiable(Hittable(WamsElement)) {
  constructor(namespace, values = {}) {
    super(values);

    /**
     * Socket.io namespace for publishing updates.
     *
     * @type {Namespace}
     */
    this.namespace = namespace;

    // Notify subscribers immediately.
    new Message(Message.ADD_ELEMENT, this).emitWith(this.namespace);
    if (values.attributes) {
      this.setAttributes(values.attributes);
    }
  }

  /*
   * Publish a general notification about the status of the image.
   */
  _emitPublication() {
    new Message(Message.UD_ITEM, this).emitWith(this.namespace);
  }

  /**
   * Remove attributes from the element.
   *
   * @param {string[]} attributes
   */
  removeAttributes(attributes) {
    attributes.forEach((attr) => {
      delete this.attributes[attr];
    });
    new Message(Message.RM_ATTRS, { id: this.id, attributes }).emitWith(this.namespace);
  }

  /**
   * Set attributes for the element.
   *
   * @param {object} attributes
   */
  setAttributes(attributes) {
    this.attributes = Object.assign(this.attributes, attributes);
    new Message(Message.SET_ATTRS, { id: this.id, attributes }).emitWith(this.namespace);
  }
}

module.exports = ServerElement;
