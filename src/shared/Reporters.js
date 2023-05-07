'use strict';

/**
 * This Item class provides a common interface between the client and the server
 * by which the Items can interact safely.
 *
 * @class Item
 * @memberof module:shared
 */
class Item {
  constructor({ x = 0, y = 0, rotation = 0, scale = 1, type = 'item/polygonal', lockZ = false } = {}) {
    /**
     * X coordinate of the Item.
     *
     * @type {number}
     * @default 0
     */
    this.x = x;

    /**
     * Y coordinate of the Item.
     *
     * @type {number}
     * @default 0
     */
    this.y = y;

    /**
     * Rotation of the Item.
     *
     * @type {number}
     * @default 0
     */
    this.rotation = rotation;

    /**
     * Scale of the Item.
     *
     * @type {number}
     * @default 1
     */
    this.scale = scale;

    /**
     * Type description of the Item.
     *
     * @type {string}
     * @default 'item/polygonal'
     */
    this.type = type;

    /**
     * Whether to raise item upon interaction or
     * lock Z position instead.
     *
     * @type {boolean}
     * @default false
     */
    this.lockZ = lockZ;
  }

  /**
   * @return object A serialized version of the item, ready for transmission.
   */
  toJSON() {
    return {
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
  constructor({
    x = 0,
    y = 0,
    width = 400,
    height = 300,
    rotation = 0,
    scale = 1,
    type = 'item/rectangular',
    lockZ = false,
  } = {}) {
    super({ x, y, rotation, scale, type, lockZ });

    /**
     * Width of the WamsElement.
     *
     * @type {number}
     * @default 400
     */
    width = width;

    /**
     * Height of the WamsElement.
     *
     * @type {number}
     * @default 300
     */
    height = height;
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
  constructor({
    x = 0,
    y = 0,
    width = 400,
    height = 300,
    rotation = 0,
    scale = 1,
    type = 'item/element',
    tagname = 'div',
    lockZ = false,
  } = {}) {
    super({ x, y, width, height, rotation, scale, type, lockZ });

    /**
     * Tag name of the WamsElement.
     *
     * @type {string}
     * @default 'div'
     */
    tagname = tagname;
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
  constructor({
    x = 0,
    y = 0,
    width = 400,
    height = 300,
    rotation = 0,
    scale = 1,
    type = 'item/image',
    lockZ = false,
  } = {}) {
    super({ x, y, width, height, rotation, scale, type, lockZ });
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
  constructor({
    x = 0,
    y = 0,
    width = 1600,
    height = 900,
    rotation = 0,
    scale = 1,
    type = 'view/background',
    lockZ = false,
    index = undefined,
  } = {}) {
    super({ x, y, width, height, rotation, scale, type, lockZ });

    /**
     * The index is an integer identifying the View, coming from ServerController.
     *
     * @name index
     * @type {number}
     * @default undefined
     * @memberof module:shared.View
     * @instance
     */
    index = undefined;
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
 * This class allows reporting of the full state of the model, for bringing
 * new clients up to speed (or potentially also for recovering a client, if
 * need be).
 *
 * @class FullStateReporter
 * @memberof module:shared
 */
class FullStateReporter {
  constructor({
    views = [],
    items = [],
    clientScripts = [],
    stylesheets = [],
    shadows = false,
    status = false,
    color = '#dad1e3',
    backgroundImage = null,
    title = 'WAMS: Workspaces Across Multiple Surfaces',
    id = null,
    useMultiScreenGestures = false,
  } = {}) {
    /**
     * All currently active views.
     *
     * @type {View[]}
     * @default []
     */
    views = views;

    /**
     * All current items.
     *
     * @type {Item[]}
     * @default []
     */
    items = items;

    /**
     * Paths to client scripts to include by browsers.
     *
     * @type {string[]}
     * @default []
     */
    clientScripts = clientScripts;

    /**
     * Paths to stylesheets to include by browsers.
     *
     * @type {string[]}
     * @default []
     */
    stylesheets = stylesheets;

    /**
     * Toggle to show/hide client shadows.
     *
     * @type {boolean}
     * @default false
     */
    shadows = shadows;

    /**
     * Toggle to show/hide current view status.
     *
     * @type {boolean}
     * @default false
     */
    status = status;

    /**
     * The background colour of the workspace.
     *
     * @type {string}
     * @default '#dad1e3'
     */
    color = color;

    /**
     * The background colour of the workspace.
     *
     * @type {string}
     * @default null
     */
    backgroundImage = backgroundImage;

    /**
     * The title of the page.
     *
     * @type {string}
     * @default 'WAMS = Workspaces Across Multiple Surfaces'
     */
    title = title;

    /**
     * The id assigned to this view.
     *
     * @type {number}
     * @default null
     */
    id = id;

    /**
     * Whether to enable multi-screen gestures
     * by processing gestures on the server side.
     *
     * @type {boolean}
     * @default false
     */
    useMultiScreenGestures = useMultiScreenGestures;
  }

  /**
   * @return object A serialized version of the full state, ready for
   * transmission.
   * @override
   */
  toJSON() {
    return {
      views: this.views.map((view) => view.toJSON()),
      items: this.items.map((item) => item.toJSON()),
      clientScripts: this.clientScripts,
      stylesheets: this.stylesheets,
      shadows: this.shadows,
      status: this.status,
      color: this.color,
      backgroundImage: this.backgroundImage,
      title: this.title,
      id: this.id,
      useMultiScreenGestures: this.useMultiScreenGestures,
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
  constructor({
    type = null,
    pointerId = null,
    clientX = null,
    clientY = null,
    target = null,
    altKey = null,
    ctrlKey = null,
    metaKey = null,
    shiftKey = null,
  } = {}) {
    /**
     * The type of event. (e.g. 'pointerdown'; 'pointermove', etc.)
     *
     * @type {string}
     * @default null
     */
    type = type;

    /**
     * The pointer ID.
     *
     * @type {number}
     * @default null
     */
    pointerId = pointerId;

    /**
     * The X coordinate of the pointer relative to the viewport.
     *
     * @type {number}
     * @default null
     */
    clientX = clientX;

    /**
     * The Y coordinate of the pointer relative to the viewport.
     *
     * @type {number}
     * @default null
     */
    clientY = clientY;

    /**
     * Whether the CTRL key was pressed at the time of the event.
     *
     * @type {boolean}
     * @default false
     */
    ctrlKey = ctrlKey;

    /**
     * Whether the ALT key was pressed at the time of the event.
     *
     * @type {boolean}
     * @default false
     */
    altKey = altKey;

    /**
     * Whether the SHIFT key was pressed at the time of the event.
     *
     * @type {boolean}
     * @default false
     */
    shiftKey = shiftKey;

    /**
     * Whether the META key was pressed at the time of the event.
     *
     * @type {boolean}
     * @default false
     */
    metaKey = metaKey;
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
  FullStateReporter,
  PointerReporter,
  WamsElement,
  WamsImage,
};
