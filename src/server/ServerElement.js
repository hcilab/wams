'use strict';

const { EventEmitter } = require('node:events');
const { Message, WamsElement } = require('../shared.js');
const { Hittable, Identifiable } = require('../mixins.js');

/**
 * HACK to get around jsdoc bug that causes mixed methods and properties to be
 * duplicated.
 *
 * @class __ServerElement
 * @private
 * @mixes module:mixins.Hittable
 * @mixes module:mixins.Identifiable
 */

/**
 * The ServerElement provides operations for the server to locate and move
 * elements around.
 *
 * @memberof module:server
 * @extends module:shared.WamsElement
 * @extends __ServerElement
 *
 * @param {Namespace} namespace - Socket.io namespace for publishing changes.
 * @param {Object} values - User-supplied data detailing the elements.
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
  }

  /*
   * Publish a general notification about the status of the image.
   */
  _emitPublication() {
    this.namespace.emit(Message.UD_ITEM, this);
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
    this.namespace.emit(Message.RM_ATTRS, { id: this.id, attributes });
  }

  /**
   * Set attributes for the element.
   *
   * @param {object} attributes
   */
  setAttributes(attributes) {
    this.attributes = Object.assign(this.attributes, attributes);
    this.namespace.emit(Message.SET_ATTRS, { id: this.id, attributes });
  }
}

Object.assign(ServerElement.prototype, EventEmitter.prototype);

module.exports = ServerElement;
