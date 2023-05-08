'use strict';

const { Point2D, IdStamper, WamsElement } = require('../shared.js');

/**
 * The ClientElement class exposes the draw() funcitonality of wams elements.
 *
 * @extends module:shared.WamsElement
 * @memberof module:client
 *
 * @param {module:shared.WamsElement} data - The data from the server describing this item.
 */
class ClientElement extends WamsElement {
  constructor(data) {
    super(data);

    /**
     * Root element where WAMS canvas and HTML elements are located.
     *
     * @type {Element}
     */
    const root = document.querySelector('#root');

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
    root.appendChild(this.element);
    if (Object.prototype.hasOwnProperty.call(data, 'attributes')) {
      this.setAttributes(data.attributes);
    }
  }

  /**
   * Render the element. Really just updates the rotation and transformation
   * matrix.
   *
   * @param {CanvasRenderingContext2D} context
   * @param {module:client.ClientView} view
   */
  draw(context, view) {
    const tl = new Point2D(this.x - view.x, this.y - view.y).divideBy(this.scale).rotate(this.rotation);
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
   * Set parent ServerGroup for the element.
   *
   * @param {module:server:ServerGroup} parent server group for this element
   */
  setParent(parent) {
    this.parent = parent;
  }

  /**
   * Removes attributes from the element.
   *
   * @param {string[]} attributes
   */
  removeAttributes(attributes) {
    attributes.forEach((attr) => {
      delete this.attributes[attr];
      this.element[attr] = null;
    });
  }
}

module.exports = ClientElement;
