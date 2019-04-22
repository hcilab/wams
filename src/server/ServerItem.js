/*
 * WAMS - An API for Multi-Surface Environments
 *
 * Author: Michael van der Kamp
 *  |-> Date: July/August 2018
 *
 * Original author: Jesse Rolheiser
 * Other revisions and supervision: Scott Bateman
 */

'use strict';

const {
  DataReporter,
  Item,
  Message,
} = require('../shared.js');
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

    // Notify subscribers immediately.
    new Message(Message.ADD_ITEM, this).emitWith(this.namespace);
    if (values.sequence) {
      this.setSequence(values.sequence);
    }
  }

  /*
   * Publish a general notification about the status of the item.
   */
  emitPublication() {
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
    const dreport = new DataReporter({
      data: {
        id: this.id,
        sequence,
      },
    });
    new Message(Message.SET_RENDER, dreport).emitWith(this.namespace);
  }
}

module.exports = ServerItem;

