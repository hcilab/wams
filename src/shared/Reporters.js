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
    Object.assign(this, { ...Item.DEFAULTS, ...values });
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
Item.DEFAULTS = {
  id: -1,
  x: 0,
  y: 0,
  rotation: 0,
  scale: 1,
  type: 'item/polygonal',
  lockZ: false,
};


class RectangularItem extends Item {
  constructor(values = {}) {
    super({ ...RectangularItem.DEFAULTS, ...values });
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
RectangularItem.DEFAULTS = {
  id: -1,
  x: 0,
  y: 0,
  width: 400,
  height: 300,
  rotation: 0,
  scale: 1,
  type: 'item/rectangular',
  lockZ: false,
};

/**
 * This WamsElement class provides a common interface between the client and the
 * server by which the elements interact safely.
 *
 * @class WamsElement
 * @memberof module:shared
 */
class WamsElement extends RectangularItem {
  constructor(values = {}) {
    super({ ...WamsElement.DEFAULTS, ...values });
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
WamsElement.DEFAULTS = {
  id: -1,
  x: 0,
  y: 0,
  width: 400,
  height: 300,
  rotation: 0,
  scale: 1,
  type: 'item/element',
  tagname: 'div',
  lockZ: false,
};

/**
 * This WamsImage class provides a common interface between the client and the
 * server by which the images can interact safely.
 *
 * @class WamsImage
 * @memberof module:shared
 */
class WamsImage extends RectangularItem {
  constructor(values = {}) {
    super({ ...DEFAULTS, ...values });
  }
}
WamsImage.DEFAULTS = {
  id: -1,
  x: 0,
  y: 0,
  width: 400,
  height: 300,
  rotation: 0,
  scale: 1,
  type: 'item/image',
  lockZ: false,
};

/**
 * This View class provides a common interface between the client and
 * the server by which the Views can interact safely.
 *
 * @class View
 * @memberof module:shared
 */
class View extends RectangularItem {
  constructor(values = {}) {
    super({ ...View.DEFAULTS, ...values });
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
View.DEFAULTS = {
  id: -1,
  x: 0,
  y: 0,
  width: 1600,
  height: 900,
  rotation: 0,
  scale: 1,
  type: 'view/background',
  lockZ: false,
  index: undefined,
};

/**
 * Enables forwarding of PointerEvents from the client to the server.
 *
 * @class PointerReporter
 * @memberof module:shared
 */
class PointerReporter {
  constructor(values = {}) {
    Object.assign(this, { ...PointerReporter.DEFAULTS, ...values });
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
PointerReporter.DEFAULTS = {
  type: null,
  pointerId: null,
  clientX: null,
  clientY: null,
  target: null,
  altKey: null,
  ctrlKey: null,
  metaKey: null,
  shiftKey: null,
};

module.exports = {
  Item,
  View,
  PointerReporter,
  WamsElement,
  WamsImage,
};
