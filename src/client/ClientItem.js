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

const { IdStamper, Item, Message } = require('../shared.js');
const { CanvasBlueprint } = require('canvas-sequencer');

/*
 * I'm not defining a 'defaults' object here, because the data going into the
 * creation of items should always come from the server, where it has already
 * gone through an initialization against a defaults object.
 */
const STAMPER = new IdStamper();

/**
 * Abstraction of the requisite logic for generating an image object which will
 * load the appropriate image and report when it has finished loading the image
 * so that it can be displayed.
 *
 * @inner
 * @memberof module:client.ClientItem
 *
 * @param {string} src - Image source path.
 *
 * @returns {?Image}
 */
function createImage(src) {
  if (src) {
    const img = new Image();
    img.src = src;
    img.loaded = false;
    img.addEventListener(
      'load',
      () => {
        img.loaded = true;
        document.dispatchEvent(new CustomEvent(Message.IMG_LOAD));
      },
      { once: true }
    );
    return img;
  }
  return null;
}

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
    STAMPER.cloneId(this, data.id);
  }

  /**
   * Overrides the default Reporter assign() method, wrapping it in
   * functionality for generating an image, or a canvas drawing blueprint and
   * sequence.
   *
   * @param {module:shared.Item} data - The data from the server describing this
   * item.
   */
  assign(data) {
    const updateImage = data.imgsrc !== this.imgsrc;
    const updateBlueprint = Boolean(data.blueprint);

    super.assign(data);
    if (updateImage) this.img = createImage(this.imgsrc);
    if (updateBlueprint) this.blueprint = new CanvasBlueprint(this.blueprint);

    // Rather than doing a bunch of checks, let's just always rebuild the
    // Sequence when updating any data in the item. Doing the checks to see if
    // This is necessary would probably take as much or more time as just
    // Going ahead and rebuilding like this anyway.
    if (this.blueprint) {
      this.sequence = this.blueprint.build(this.report());
    }
  }

  /**
   * Render the item onto the given context.  Prioritizes blueprints over
   * images.
   *
   * @param {CanvasRenderingContext2D} context - context onto which to draw this
   * item.
   */
  draw(context) {
    context.save();
    context.translate(this.x, this.y);
    context.rotate(-this.rotation);
    context.scale(this.scale, this.scale);
    if (this.sequence) {
      this.sequence.execute(context);
    } else if (this.img && this.img.loaded) {
      context.drawImage(this.img, 0, 0, this.img.width, this.img.height);
    }
    context.restore();
  }
}

module.exports = ClientItem;

