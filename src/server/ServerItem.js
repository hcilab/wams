'use strict';

const { EventEmitter } = require('node:events');
const { CanvasItem, Message } = require('../shared.js');
const { Hittable, Identifiable } = require('../mixins.js');

/**
 * HACK to get around jsdoc bug that causes mixed methods and properties to be
 * duplicated.
 *
 * @class __ServerItem
 * @private
 * @mixes module:mixins.Hittable
 * @mixes module:mixins.Identifiable
 */

/**
 * The ServerItem provides operations for the server to locate and move items
 * around.
 *
 * @memberof module:server
 * @extends module:shared.CanvasItem
 * @extends __ServerItem
 *
 * @param {Namespace} namespace - Socket.io namespace for publishing changes.
 * @param {Object} values - User-supplied data detailing the item.
 */
class ServerItem extends Identifiable(Hittable(CanvasItem)) {
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
   * Publish a general notification about the status of the item.
   */
  _emitPublication() {
    this.namespace.emit(Message.UD_ITEM, this);
  }

  /**
   * Set the render sequence.
   *
   * @param {CanvasSequence} sequence - The sequence of rendering instructions
   * for this item.
   */
  setSequence(sequence) {
    this.sequence = sequence;
    this.namespace.emit(Message.SET_RENDER, { id: this.id, sequence });
  }
}

Object.assign(ServerItem.prototype, EventEmitter.prototype);

module.exports = ServerItem;
