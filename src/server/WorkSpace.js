/*
 * WAMS - An API for Multi-Surface Environments
 *
 * Author: Michael van der Kamp
 *  |-> Date: July/August 2018
 *
 * Original author: Jesse Rolheiser
 * Other revisions and supervision: Scott Bateman
 */

'use strict';

const {
  findLast,
  mergeMatches,
  safeRemoveById,
  Message,
} = require('../shared.js');
const ServerImage = require('./ServerImage.js');
const ServerItem = require('./ServerItem.js');

/**
 * The WorkSpace keeps track of views and items, and can handle events on
 * those items and views which allow them to be interacted with.
 *
 * @memberof module:server
 */
class WorkSpace {
  /**
   * @param {object} [settings] - Options received from user.
   * @param {string} [settings.color='gray'] - Background color for the
   * workspace.
   * @param {boolean} [settings.useServerGestures=false] - Whether to use
   * server-side gestures. Default is to use client-side gestures.
   * @param {Namespace} namespace - Socket.io namespace for publishing changes.
   */
  constructor(settings, namespace) {
    /**
     * Configuration settings for the workspace.
     *
     * @type {object}
     * @property {string} [color='gray'] - Background color for the workspace.
     * @property {boolean} [settings.useServerGestures=false] - Whether to use
     * server-side gestures. Default is to use client-side gestures.
     */
    this.settings = mergeMatches(WorkSpace.DEFAULTS, settings);

    /**
     * Socket.io namespace in which to operate.
     *
     * @type {Namespace}
     */
    this.namespace = namespace;

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
   * @param {number} x - x coordinate at which to look for items.
   * @param {number} y - y coordinate at which to look for items.
   *
   * @return {?module:server.ServerItem} A free item at the given coordinates,
   * or null if there is none.
   */
  findFreeItemByCoordinates(x, y) {
    return findLast(this.items, i => !i.isLocked() && i.containsPoint(x, y));
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
    return findLast(this.items, i => i.containsPoint(x, y));
  }

  /**
   * Gives a lock on the item at (x,y) to the view.
   *
   * @param {number} x - x coordinate at which to look for items.
   * @param {number} y - y coordinate at which to look for items.
   * @param {module:server.ServerView} view - View that will receive a lock on
   * the item.
   */
  obtainLock(x, y, view) {
    const p = view.transformPoint(x, y);
    const item = this.findFreeItemByCoordinates(p.x, p.y) || view;
    view.obtainLockOnItem(item);
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
    if (safeRemoveById(this.items, item, ServerItem)) {
      new Message(Message.RM_ITEM, item).emitWith(this.namespace);
    }
  }

  /**
   * @return {module:shared.Item[]} Reports of the currently active items.
   */
  reportItems() {
    return this.items.map(o => {
      const report = o.report();
      if (o instanceof ServerImage) {
        report.src = o.src;
      } else {
        report.sequence = o.sequence;
      }
      return report;
    });
  }

  /**
   * Spawn a new image with the given values.
   *
   * @param {object} values - Values describing the image to spawn.
   *
   * @return {module:server.ServerImage} The newly spawned image.
   */
  spawnImage(values = {}) {
    const image = new ServerImage(this.namespace, values);
    this.items.push(image);
    return image;
  }

  /**
   * Spawn a new item with the given values.
   *
   * @param {object} values - Values describing the item to spawn.
   *
   * @return {module:server.ServerItem} The newly spawned item.
   */
  spawnItem(values = {}) {
    const item = new ServerItem(this.namespace, values);
    this.items.push(item);
    return item;
  }
}

/**
 * The default values for a WorkSpace.
 *
 * @type {object}
 */
WorkSpace.DEFAULTS = Object.freeze({
  color:             '#dad1e3',
  useServerGestures: false,
});

module.exports = WorkSpace;

