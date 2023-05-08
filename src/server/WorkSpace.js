'use strict';

const { removeById, Message } = require('../shared.js');
const ServerGroup = require('./ServerGroup.js');
const ServerElement = require('./ServerElement.js');
const ServerImage = require('./ServerImage.js');
const ServerItem = require('./ServerItem.js');

/**
 * The WorkSpace keeps track of views and items, and can handle events on
 * those items and views which allow them to be interacted with.
 *
 * @memberof module:server
 *
 * @param {object} [settings] Options received from user.
 * @param {string} [settings.color='gray'] Background color for the workspace.
 * @param {boolean} [settings.useMultiScreenGestures=false] - Whether to use
 * server-side gestures. Default is to use client-side gestures.
 * @param {Namespace} namespace - Socket.io namespace for publishing changes.
 */
class WorkSpace {
  constructor(settings, namespace) {
    /**
     * Configuration settings for the workspace.
     *
     * @type {object}
     * @property {string} [color='gray'] Background color for the workspace.
     * @property {boolean} [settings.useMultiScreenGestures=false] Whether
     * to use
     * server-side gestures. Default is to use client-side gestures.
     */
    this.settings = { ...WorkSpace.DEFAULTS, ...settings };

    /**
     * Socket.io namespace in which to operate.
     *
     * @type {Namespace}
     */
    this.namespace = namespace;

    /**
     * A place for user to store workspace state.
     */
    this.state = {};

    /**
     * Track all items in the workspace.
     *
     * @type {module:server.ServerItem[]}
     */
    this.items = [];
  }

  /**
   * Looks for an unlocked item at the given coordinates and returns the first
   * one that it finds, or none if no unlocked items are found.
   *
   * @param {number} x x coordinate at which to look for items.
   * @param {number} y y coordinate at which to look for items.
   *
   * @return {?module:server.ServerItem} A free item at the given coordinates,
   * or null if there is none.
   */
  findFreeItemByCoordinates(x, y) {
    return this.items.find((i) => !i.isLocked() && i.containsPoint(x, y));
  }

  /**
   * Looks for any item at the given coordinates.
   *
   * @param {number} x - x coordinate at which to look for items.
   * @param {number} y - y coordinate at which to look for items.
   *
   * @return {?module:server.ServerItem} An item at the given coordinates, or
   * null if there is none.
   */
  findItemByCoordinates(x, y) {
    return this.items.find((i) => i.containsPoint(x, y));
  }

  /**
   * Gives a lock on the item at (x,y) or view itself to the view.
   *
   * @param {number} x - x coordinate at which to look for items.
   * @param {number} y - y coordinate at which to look for items.
   * @param {module:server.ServerView} view - View that will receive a lock on
   * the item/view.
   */
  obtainLock(x, y, view) {
    const p = view.transformPoint(x, y);
    const item = this.findFreeItemByCoordinates(p.x, p.y) || view;
    const itemClass = item.constructor.name;
    if (itemClass !== 'ServerView' && itemClass !== 'ServerViewGroup') {
      if (!item.lockZ) this.raiseItem(item);
      if (this._canLock(item)) {
        view.obtainLockOnItem(item);
      } else {
        view.obtainLockOnItem(view);
      }
    } else {
      view.obtainLockOnItem(view);
    }
  }

  _canLock(item) {
    const eventNames = item.eventNames();
    return (
      item.ondrag ||
      item.onpinch ||
      item.onrotate ||
      item.onswipe ||
      eventNames.includes('drag') ||
      eventNames.includes('pinch') ||
      eventNames.includes('rotate') ||
      eventNames.includes('swipe')
    );
  }

  /**
   * Raises item above others and notifies subscribers.
   *
   * @param {*} item
   */
  raiseItem(item) {
    const highestItem = this.items[0];
    // don't raise if item is already on top
    if (highestItem.id === item.id) return;
    this.bringItemToTop(item.id);
    item.publish();
  }

  /**
   * Bring item to top, so that it's above others.
   *
   * @param {number} id
   */
  bringItemToTop(id) {
    const index = this.items.findIndex((el) => el.id === id);
    if (index < 0) throw new Error("Couldn't find item by id");
    this.items.unshift(...this.items.splice(index, 1));
  }

  /**
   * Remove the given item from the workspace.
   *
   * @param {module:server.ServerItem} item - Item to remove.
   *
   * @return {boolean} true if the item was located and removed, false
   * otherwise.
   */
  removeItem(item) {
    if (removeById(this.items, item)) {
      item.unlock();
      this.namespace.emit(Message.RM_ITEM, item);
    }
  }

  /**
   * @return {module:shared.Item[]} Serialize the workspace items.
   */
  toJSON() {
    return this.items.map((o) => {
      const json = o.toJSON();
      if (o instanceof ServerImage) {
        json.src = o.src;
      } else if (o instanceof ServerElement) {
        json.attributes = o.attributes;
      } else {
        json.sequence = o.sequence;
      }
      return json;
    });
  }

  /**
   * Spawn a new workspace object of the given type, with the given values.
   *
   * @param {function} ClassFn
   * @param {object} values
   *
   * @return {object} The newly spawned object.
   */
  spawnObject(ClassFn, values) {
    const object = new ClassFn(this.namespace, values);
    this.items.unshift(object);
    return object;
  }

  /**
   * Spawn a new element with the given values.
   *
   * @param {object} values - Values describing the element to spawn.
   *
   * @return {module:server.ServerElement} The newly spawned element.
   */
  spawnElement(values = {}) {
    return this.spawnObject(ServerElement, values);
  }

  /**
   * Spawn a new image with the given values.
   *
   * @param {object} values - Values describing the image to spawn.
   *
   * @return {module:server.ServerImage} The newly spawned image.
   */
  spawnImage(values = {}) {
    return this.spawnObject(ServerImage, values);
  }

  /**
   * Spawn a new item with the given values.
   *
   * @param {object} values - Values describing the item to spawn.
   *
   * @return {module:server.ServerItem} The newly spawned item.
   */
  spawnItem(values = {}) {
    return this.spawnObject(ServerItem, values);
  }

  /**
   * Create a group for existing items in the workspace.
   *
   * @param {any} values properties for the group
   */
  createGroup(values) {
    return this.spawnObject(ServerGroup, values);
  }
}

/**
 * The default values for a WorkSpace.
 *
 * @type {object}
 */
WorkSpace.DEFAULTS = Object.freeze({
  color: '#dad1e3',
  useMultiScreenGestures: false,
});

module.exports = WorkSpace;
