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
  Item,
  Message,
} = require('../shared.js');
const { Hittable } = require('../mixins.js');

/**
 * The ServerItem provides operations for the server to locate and move items
 * around.
 *
 * @memberof module:server
 * @extends module:shared.Item
 * @mixes module:mixins.Hittable
 */
class ServerItem extends Hittable(Item) {
  /**
   * @param {Namespace} namespace - Socket.io namespace for publishing changes.
   * @param {Object} values - User-supplied data detailing the item. Properties
   * on this object that line up with {@link module:shared.Item} members will be
   * stored. Any other properties will be ignored.
   */
  constructor(namespace, values = {}) {
    super({ ...ServerItem.DEFAULTS, ...values });

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
   * Publish a general notification about the status of the item.
   */
  publish() {
    new Message(Message.UD_ITEM, this).emitWith(this.namespace);
  }

  /**
   * Set the render sequence.
   *
   * @param {CanvasSequence} sequence - The sequence of rendering instructions
   * for this item.
   */
  setSequence(sequence) {
    this.blueprint = sequence;
    this.schedulePublication();
  }
}

/**
 * The default values for a ServerItem.
 *
 * @type {Object}
 */
ServerItem.DEFAULTS = Object.freeze({
  x:         0,
  y:         0,
  hitbox:    null,
  rotation:  0,
  scale:     1,
  type:      'item/polygonal',
  imgsrc:    '',
  blueprint: null,
});

module.exports = ServerItem;

