'use strict';

/**
 * This Item class provides a common interface between the client and the server
 * by which the Items can interact safely.
 *
 * @private
 * @memberof module:shared
 * @param {Object} values - User-supplied data detailing the item.
 */
class Item {
  constructor(values = {}) {
    Object.assign(this, {
      id: null,

      /**
       * @name x
       * @type {number}
       * @default 0
       * @memberof module:shared.Item
       * @instance
       */
      x: 0,

      /**
       * @name y
       * @type {number}
       * @default 0
       * @memberof module:shared.Item
       * @instance
       */
      y: 0,

      /**
       * @name rotation
       * @type {number}
       * @default 0
       * @memberof module:shared.Item
       * @instance
       */
      rotation: 0,

      /**
       * @name scale
       * @type {number}
       * @default 1
       * @memberof module:shared.Item
       * @instance
       */
      scale: 1,

      /**
       * @name type
       * @type {string}
       * @default 'item/polygonal'
       * @memberof module:shared.Item
       * @instance
       */
      type: 'item',

      /**
       * Whether to raise item upon interaction or lock Z position instead.
       *
       * @name lockZ
       * @type {boolean}
       * @default false
       * @memberof module:shared.Item
       * @instance
       */
      lockZ: false,

      ...values, // Assigns additional attributes to the object
    });
  }

  /**
   * @return object A serialized version of the item, ready for transmission.
   */
  toJSON() {
    return {
      id: this.id,
      x: this.x,
      y: this.y,
      rotation: this.rotation,
      scale: this.scale,
      type: this.type,
      lockZ: this.lockZ,
    };
  }
}

/**
 * This CanvasItem class provides a common interface between the client and the
 * server by which items that are defined by sequences of canvas instructions
 * can be rendered safely.
 *
 * @private
 * @memberof module:shared
 * @param {Object} values - User-supplied data detailing the item.
 */
class CanvasItem extends Item {
  constructor(values = {}) {
    super({
      /**
       * @name sequence
       * @type {CanvasSequence}
       * @default undefined
       * @memberof module:shared.CanvasItem
       * @instance
       */
      sequence: undefined,

      type: 'item',
      ...values, // Assigns additional attributes to the object
    });
  }

  /**
   * Serialize the item as a JSON object.
   *
   * @returns {Object} The item as a JSON object.
   * @override
   */
  toJSON() {
    return {
      ...super.toJSON(),
      sequence: this.sequence,
    };
  }
}

/**
 * This RectangularItem class provides a common interface between the client and
 * the server by which the RectangularItems can interact safely.
 *
 * @private
 * @extends module:shared.Item
 * @memberof module:shared
 * @param {Object} values - User-supplied data detailing the item.
 */
class RectangularItem extends Item {
  constructor(values = {}) {
    super({
      /**
       * @name width
       * @type {number}
       * @default 400
       * @memberof module:shared.WamsElement
       * @instance
       */
      width: 400,

      /**
       * @name height
       * @type {number}
       * @default 300
       * @memberof module:shared.WamsElement
       * @instance
       */
      height: 300,

      type: 'item',
      ...values, // Assigns additional attributes to the object
    });
  }

  /**
   * @return object A serialized version of the item, ready for transmission.
   * @override
   */
  toJSON() {
    return {
      ...super.toJSON(),
      width: this.width,
      height: this.height,
    };
  }
}

/**
 * This WamsElement class provides a common interface between the client and the
 * server by which the elements interact safely.
 *
 * @private
 * @extends module:shared.RectangularItem
 * @memberof module:shared
 * @param {Object} values - User-supplied data detailing the item.
 */
class WamsElement extends RectangularItem {
  constructor(values = {}) {
    super({
      /**
       * Type of DOM element this represents.
       *
       * @name tagname
       * @type {string}
       * @default 'div'
       * @memberof module:shared.WamsElement
       * @instance
       */
      tagname: 'div',

      /**
       * Additional attributes to set on the DOM element.
       *
       * @name attributes
       * @type {object}
       * @default {}
       * @memberof module:shared.WamsElement
       * @instance
       * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes}
       * @example
       * {
       *  class: 'my-class',
       *  id: 'my-id',
       *  style: 'background-color: red;',
       *  ...
       *  // Any other attribute you want to set on the element
       * }
       */
      attributes: {},

      type: 'item/element',
      ...values, // Assigns additional attributes to the object
    });
  }

  /**
   * @return object A serialized version of the item, ready for transmission.
   */
  toJSON() {
    return {
      ...super.toJSON(),
      tagname: this.tagname,
      attributes: this.attributes,
    };
  }
}

/**
 * This WamsImage class provides a common interface between the client and the
 * server by which the images can interact safely.
 *
 * @private
 * @extends module:shared.RectangularItem
 * @memberof module:shared
 * @param {Object} values - User-supplied data detailing the item.
 */
class WamsImage extends RectangularItem {
  constructor(values = {}) {
    super({
      /**
       * Source of the image.
       *
       * @name src
       * @type {string}
       * @default ''
       * @memberof module:shared.WamsImage
       * @instance
       */
      src: '',

      type: 'item/image',
      ...values, // Assigns additional attributes to the object
    });
  }

  /**
   * Serialize the image as a JSON object.
   *
   * @returns {Object} The image as a JSON object.
   * @override
   */
  toJSON() {
    return {
      ...super.toJSON(),
      src: this.src,
    };
  }
}

/**
 * This View class provides a common interface between the client and
 * the server by which the Views can interact safely.
 *
 * @private
 * @memberof module:shared
 * @extends module:shared.RectangularItem
 * @param {Object} values - User-supplied data detailing the item.
 */
class View extends RectangularItem {
  constructor(values = {}) {
    super({
      width: 1600,
      height: 900,

      /**
       * The index is an integer identifying the View, coming from ServerController.
       *
       * @name index
       * @type {number}
       * @default undefined
       * @memberof module:shared.View
       * @instance
       */
      index: undefined,

      type: 'view/background',
      ...values, // Assigns additional attributes to the object
    });
  }

  /**
   * @return object A serialized version of the view, ready for transmission.
   * @override
   */
  toJSON() {
    return {
      ...super.toJSON(),
      index: this.index,
    };
  }
}

module.exports = {
  CanvasItem,
  Item,
  View,
  WamsElement,
  WamsImage,
};
