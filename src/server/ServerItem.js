'use strict';

const { Item, Message } = require('../shared.js');
const { Hittable, Identifiable } = require('../mixins.js');

/**
 * The ServerItem provides operations for the server to locate and move items
 * around.
 *
 * @memberof module:server
 * @extends module:shared.Item
 * @mixes module:mixins.Hittable
 * @mixes module:mixins.Identifiable
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

    // Notify subscribers immediately.
    new Message(Message.ADD_ITEM, this).emitWith(this.namespace);
    if (values.sequence) {
      this.setSequence(values.sequence);
    }
  }

  /*
   * Publish a general notification about the status of the item.
   */
  _emitPublication() {
    new Message(Message.UD_ITEM, this).emitWith(this.namespace);
  }

  /**
   * Set the render sequence.
   *
   * @param {CanvasSequence} sequence - The sequence of rendering instructions
   * for this item.
   */
  setSequence(sequence) {
    this.sequence = sequence;
    new Message(Message.SET_RENDER, { id: this.id, sequence }).emitWith(this.namespace);
  }
}

module.exports = ServerItem;
