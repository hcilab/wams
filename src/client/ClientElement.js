/*
 * WAMS code to be executed in the client browser.
 *
 * Author: Michael van der Kamp
 */

'use strict';

const { Point2D, IdStamper, WamsElement } = require('../shared.js');

/**
 * The ClientElement class exposes the draw() funcitonality of wams elements.
 *
 * @extends module:shared.WamsElement
 * @memberof module:client
 *
 * @param {module:shared.WamsElement} data - The data from the server describing
 * this item. Only properties explicity listed in the array passed to the
 * ReporterFactory when the WamsElement class was defined will be accepted.
 */
class ClientElement extends WamsElement {
  constructor(data) {
    super(data);

    /**
     * The DOM element.
     *
     * @type {Element}
     */
    this.element = document.createElement(data.tagname);
    this.element.classList.add('wams-element');
    this.element.width = this.width;
    this.element.height = this.height;
    this.element.style.width = `${this.width}px`;
    this.element.style.height = `${this.height}px`;
    document.body.appendChild(this.element);
    if (data.hasOwnProperty('attributes')) {
      this.setAttributes(data.attributes);
    }

    /**
     * Id to make the items uniquely identifiable.
     *
     * @name id
     * @type {number}
     * @constant
     * @instance
     * @memberof module:client.ClientElement
     */
    IdStamper.cloneId(this, data.id);
  }

  /**
   * Render the element. Really just updates the rotation and transformation
   * matrix.
   *
   * @param {CanvasRenderingContext2D} context
   * @param {module:client.ClientView} view
   */
  draw(context, view) {
    const tl = new Point2D(this.x - view.x, this.y - view.y)
      .divideBy(this.scale)
      .rotate(this.rotation);
    const rotate = `rotate(${view.rotation - this.rotation}rad) `;
    const scale = `scale(${this.scale * view.scale}) `;
    const translate = `translate(${tl.x}px, ${tl.y}px) `;
    this.element.style.transform = scale + rotate + translate;
  }

  /**
   * Sets attributes for the element.
   *
   * @param {object} attributes
   */
  setAttributes(attributes) {
    this.attributes = attributes;
    Object.entries(attributes).forEach(([k, v]) => {
      this.element[k] = v;
    });
  }

  /**
   * Removes attributes from the element.
   *
   * @param {string[]} attributes
   */
  removeAttributes(attributes) {
    attributes.forEach(attr => {
      delete this.attributes[attr];
      this.element[attr] = null;
    });
  }
}

module.exports = ClientElement;

