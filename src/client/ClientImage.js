/*
 * WAMS code to be executed in the client browser.
 *
 * Author: Michael van der Kamp
 */

'use strict';

const { IdStamper, WamsImage, Message } = require('../shared.js');

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
 *
 * @param {module:shared.Item} data - The data from the server describing this
 * item. Only properties explicity listed in the array passed to the
 * ReporterFactory when the Item class was defined will be accepted.
 */
class ClientImage extends WamsImage {
  constructor(data) {
    super(data);

    /**
     * The image to render.
     *
     * @type {Image}
     */
    this.image = {};
    if (data.src) this.setImage(data.src);

    /**
     * Id to make the items uniquely identifiable.
     *
     * @name id
     * @type {number}
     * @constant
     * @instance
     * @memberof module:client.ClientImage
     */
    IdStamper.cloneId(this, data.id);
  }

  /**
   * Render the image onto the given context.
   *
   * @param {CanvasRenderingContext2D} context
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
   * Set parent ServerGroup for the image.
   *
   * @param {module:server:ServerGroup} parent server group for this image
   */
  setParent(parent) {
    this.parent = parent;
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
