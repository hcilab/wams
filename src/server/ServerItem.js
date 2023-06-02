'use strict';

const { EventEmitter } = require('node:events');
const { Item, Message } = require('../shared.js');
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
 * @extends module:shared.Item
 * @extends __ServerItem
 *
 * @param {Namespace} namespace - Socket.io namespace for publishing changes.
 * @param {Object} values - User-supplied data detailing the item. Properties on
 * this object that line up with {@link module:shared.Item} members will be
 * stored. Any other properties will be ignored.
 */
class ServerItem extends Identifiable(Hittable(Item)) {
  constructor(namespace, values = {}) {
    super(values);

    /**
     * Socket.io namespace for publishing updates.
     *
     * @type {Namespace}
     */
    this.namespace = namespace;

    /**
     * Sequence of canvas instructions to be run on the client
     *
     * @type {CanvasSequence}
     * @default undefined
     */
    this.sequence = undefined;
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

  /**
   * Serialize the item as a JSON object.
   *
   * @returns {Object} The item as a JSON object.
   * @override
   */
  toJSON() {
    return {
      ...super.toJSON(),
      sequence: this.sequence,
    };
  }
}

Object.assign(ServerItem.prototype, EventEmitter.prototype);

module.exports = ServerItem;
