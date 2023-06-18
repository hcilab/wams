'use strict';

const { Item } = require('../shared.js');
const { CanvasSequence } = require('canvas-sequencer');

/**
 * The ClientItem class exposes the draw() funcitonality of wams items.
 *
 * @extends module:shared.Item
 * @memberof module:client
 *
 * @param {module:shared.Item} data - The data from the server describing this item.
 */
class ClientItem extends Item {
  constructor(data) {
    super(data);

    /**
     * The actual render.
     *
     * @type {CanvasSequence}
     */
    this.render = null;
    if (data.sequence) this.setRender(data.sequence);
  }

  /**
   * Render the item onto the given context.
   *
   * @param {CanvasRenderingContext2D} context
   */
  draw(context) {
    if (this.render) {
      context.save();
      context.translate(this.x, this.y);
      context.rotate(-this.rotation);
      context.scale(this.scale, this.scale);
      this.render.execute(context);
      context.restore();
    }
  }

  /**
   * Set parent ServerItemGroup for the item.
   *
   * @param {module:server:ServerItemGroup} parent server group for this item
   */
  setParent(parent) {
    this.parent = parent;
  }

  /**
   * Set the item's canvas rendering sequence.
   *
   * @param {CanvasSequence} sequence - Raw, unrevived CanvasSequence.
   */
  setRender(sequence) {
    this.render = new CanvasSequence(sequence);
  }
}

module.exports = ClientItem;
