/*
 * WAMS code to be executed in the client browser.
 *
 * Author: Michael van der Kamp
 *  |-> Date: July/August 2018
 *
 * Original author: Jesse Rolheiser
 * Other revisions and supervision: Scott Bateman
 */

'use strict';

const { IdStamper, Item } = require('../shared.js');
const { CanvasSequence } = require('canvas-sequencer');

const STAMPER = new IdStamper();

/**
 * The ClientItem class exposes the draw() funcitonality of wams items.
 *
 * @extends module:shared.Item
 * @memberof module:client
 *
 * @param {module:shared.Item} data - The data from the server describing this
 * item. Only properties explicity listed in the array passed to the
 * ReporterFactory when the Item class was defined will be accepted.
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

    /**
     * Id to make the items uniquely identifiable.
     *
     * @name id
     * @type {number}
     * @constant
     * @instance
     * @memberof module:client.ClientItem
     */
    STAMPER.cloneId(this, data.id);
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
   * Set the item's canvas rendering sequence.
   *
   * @param {CanvasSequence} sequence - Raw, unrevived CanvasSequence.
   */
  setRender(sequence) {
    this.render = new CanvasSequence(sequence);
  }
}

module.exports = ClientItem;

