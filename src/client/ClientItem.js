/*
 * WAMS code to be executed in the client browser.
 *
 * Author: Michael van der Kamp
 *  |-> Date: July/August 2018
 *
 * Original author: Jesse Rolheiser
 * Other revisions and supervision: Scott Bateman
 *
 * The ClientItem class exposes the draw() funcitonality of wams items.
 */

'use strict';

const { IdStamper, Item, Message } = require('../shared.js');
const { CanvasBlueprint } = require('canvas-sequencer');

/*
 * I'm not defining a 'defaults' object here, because the data going into
 * the creation of items should always come from the server, where it has
 * already gone through an initialization against a defaults object.
 */
const STAMPER = new IdStamper();

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

class ClientItem extends Item {
  constructor(data) {
    super(data);
    STAMPER.cloneId(this, data.id);
  }

  assign(data) {
    const updateImage = data.imgsrc !== this.imgsrc;
    const updateBlueprint = Boolean(data.blueprint);

    super.assign(data);
    if (updateImage) this.img = createImage(this.imgsrc);
    if (updateBlueprint) this.blueprint = new CanvasBlueprint(this.blueprint);

    // Rather than doing a bunch of checks, let's just always rebuild the
    // sequence when updating any data in the item. Doing the checks to see if
    // this is necessary would probably take as much or more time as just
    // going ahead and rebuilding like this anyway.
    if (this.blueprint) {
      this.sequence = this.blueprint.build(this.report());
    }
  }

  draw(context) {
    const width = this.width || this.img.width;
    const height = this.height || this.img.height;

    if (this.sequence) {
      this.sequence.execute(context);
    } else if (this.img && this.img.loaded) {
      context.drawImage(this.img, this.x, this.y, width, height);
    } else {
      // Draw placeholder rectangle.
      context.save();
      context.fillStyle = '#252525';
      context.fillRect(this.x, this.y, width, height);
      context.restore();
    }
  }
}

module.exports = ClientItem;

