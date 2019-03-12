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

/*
 * I'm not defining a 'defaults' object here, because the data going into the
 * creation of items should always come from the server, where it has already
 * gone through an initialization against a defaults object.
 */
const STAMPER = new IdStamper();

/**
 * The ClientItem class exposes the draw() funcitonality of wams items.
 *
 * @extends module:shared.Item
 * @memberof module:client
 */
class ClientItem extends Item {
  /**
   * @param {module:shared.Item} data - The data from the server describing this
   *       item. Only properties explicity listed in the array passed to the
   *       ReporterFactory when the Item class was defined will be accepted.
   */
  constructor(data) {
    super(data);

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
   * Overrides the default Reporter assign() method, wrapping it in
   * functionality for generating an image, or a canvas drawing sequence and
   * sequence.
   *
   * @param {module:shared.Item} data - The data from the server describing this
   * item.
   */
  assign(data) {
    super.assign(data);

    if (this.render == null) {
      /**
       * The actual render.
       *
       * @type {CanvasSequence}
       */
      this.render = new CanvasSequence(data.sequence);
    }
  }

  /**
   * Render the item onto the given context.  Prioritizes sequences over
   * images.
   *
   * @param {CanvasRenderingContext2D} context - context onto which to draw this
   * item.
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
}

module.exports = ClientItem;

