/*
 * WAMS code to be executed in the client browser.
 *
 * Author: Michael van der Kamp
 */

'use strict';

const { IdStamper, WamsImage, Message } = require('../shared.js');

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
 * @memberof module:client.ClientImage
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
  return {};
}

/**
 * The ClientImage class exposes the draw() funcitonality of wams items.
 *
 * @extends module:shared.WamsImage
 * @memberof module:client
 */
class ClientImage extends WamsImage {
  /**
   * @param {module:shared.Item} data - The data from the server describing this
   *       item. Only properties explicity listed in the array passed to the
   *       ReporterFactory when the Item class was defined will be accepted.
   */
  constructor(data) {
    super(data);

    /**
     * The image to render.
     *
     * @type {Image}
     */
    this.image = null;
    if (data.src) this.setImage(data.src);
    // this.image = createImage(this.src);

    /**
     * Id to make the items uniquely identifiable.
     *
     * @name id
     * @type {number}
     * @constant
     * @instance
     * @memberof module:client.ClientImage
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
  // assign(data) {
  //   if (data.src !== this.src) this.image = createImage(data.src);
  //   super.assign(data);
  // }

  /**
   * Render the item onto the given context.  Prioritizes sequences over
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
    if (this.image.loaded) {
      context.drawImage(this.image, 0, 0, this.width, this.height);
    } else {
      context.fillStyle = 'darkgrey';
      context.fillRect(0, 0, this.width, this.height);
    }
    context.restore();
  }

  /**
   * Sets the image path and loads the image.
   *
   * @param {string} path - The image's source path
   */
  setImage(path) {
    this.src = path;
    this.image = createImage(path);
  }
}

module.exports = ClientImage;

