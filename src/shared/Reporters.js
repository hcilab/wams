'use strict';

/**
 * This Item class provides a common interface between the client and the server
 * by which the Items can interact safely.
 *
 * @class Item
 * @memberof module:shared
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
      type: 'item/polygonal',

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

      ...values,  // Assigns additional attributes to the object
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

      type: 'item/rectangular',
      ...values,  // Assigns additional attributes to the object
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
 * @class WamsElement
 * @memberof module:shared
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

      type: 'item/element',
      ...values,  // Assigns additional attributes to the object
    });
  }

  /**
   * @return object A serialized version of the item, ready for transmission.
   */
  toJSON() {
    return {
      ...super.toJSON(),
      tagname: this.tagname,
    };
  }
}

/**
 * This WamsImage class provides a common interface between the client and the
 * server by which the images can interact safely.
 *
 * @class WamsImage
 * @memberof module:shared
 */
class WamsImage extends RectangularItem {
  constructor(values = {}) {
    super({
      type: 'item/image',
      ...values,  // Assigns additional attributes to the object
    });
  }
}

/**
 * This View class provides a common interface between the client and
 * the server by which the Views can interact safely.
 *
 * @class View
 * @memberof module:shared
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
      ...values,  // Assigns additional attributes to the object
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

/**
 * Enables forwarding of PointerEvents from the client to the server.
 *
 * @class PointerReporter
 * @memberof module:shared
 */
class PointerReporter {
  constructor(values = {}) {
    Object.assign(this, {
      type: null,
      pointerId: null,
      clientX: null,
      clientY: null,
      target: null,
      altKey: null,
      ctrlKey: null,
      metaKey: null,
      shiftKey: null,
      ...values,  // Assigns additional attributes to the object
    });
  }

  /**
   * @return object A serialized version of the pointer event, ready for
   * transmission.
   * @override
   */
  toJSON() {
    return {
      type: this.type,
      pointerId: this.pointerId,
      clientX: this.clientX,
      clientY: this.clientY,
      target: this.target,
      altKey: this.altKey,
      ctrlKey: this.ctrlKey,
      metaKey: this.metaKey,
      shiftKey: this.shiftKey,
    };
  }
}

module.exports = {
  Item,
  View,
  PointerReporter,
  WamsElement,
  WamsImage,
};
