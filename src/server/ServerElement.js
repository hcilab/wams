/*
 * WAMS - An API for Multi-Surface Environments
 *
 * Author: Michael van der Kamp
 */

'use strict';

const {
  DataReporter,
  Message,
  WamsElement,
} = require('../shared.js');
const { Hittable, Identifiable } = require('../mixins.js');

/**
 * The ServerElement provides operations for the server to locate and move
 * images around.
 *
 * @memberof module:server
 * @extends module:shared.WamsElement
 * @mixes module:mixins.Hittable
 * @mixes module:mixins.Identifiable
 */
class ServerElement extends Identifiable(Hittable(WamsElement)) {
  /**
   * @param {Namespace} namespace - Socket.io namespace for publishing changes.
   * @param {Object} values - User-supplied data detailing the image. Properties
   * on this object that line up with {@link module:shared.Element} members will
   * be stored. Any other properties will be ignored.
   */
  constructor(namespace, values = {}) {
    super({ ...ServerElement.DEFAULTS, ...values });

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
  emitPublication() {
    new Message(Message.UD_ITEM, this).emitWith(this.namespace);
  }

  /**
   * Remove attributes from the element.
   *
   * @param {string[]} attributes
   */
  removeAttributes(attributes) {
    attributes.forEach(attr => {
      delete this.attributes[attr];
    });
    const dreport = new DataReporter({
      data: {
        id: this.id,
        attributes,
      },
    });
    new Message(Message.RM_ATTRS, dreport).emitWith(this.namespace);
  }

  /**
   * Set attributes for the element.
   *
   * @param {object} attributes
   */
  setAttributes(attributes) {
    this.attributes = Object.assign(this.attributes, attributes);
    const dreport = new DataReporter({
      data: {
        id:  this.id,
        attributes,
      },
    });
    new Message(Message.SET_ATTRS, dreport).emitWith(this.namespace);
  }
}

/**
 * The default values for a ServerElement.
 *
 * @type {Object}
 */
ServerElement.DEFAULTS = Object.freeze({
  x:         0,
  y:         0,
  width:     400,
  height:    300,
  hitbox:    null,
  rotation:  0,
  scale:     1,
  type:      'item/image',
  tagname:   'div',
});

module.exports = ServerElement;

