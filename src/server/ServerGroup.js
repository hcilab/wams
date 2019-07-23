/*
 * WAMS - An API for Multi-Surface Environments
 *
 * Author: Mykyta Baliesnyi
 */

'use strict';

const {
  DataReporter,
  Message,
  Item,
} = require('../shared.js');
const { Hittable, Identifiable } = require('../mixins.js');

/**
 * The ServerGroup provides operations for the server to locate and move
 * several different elements around.
 *
 * @memberof module:server
 * @extends module:shared.WamsElement
 * @mixes module:mixins.Hittable
 * @mixes module:mixins.Identifiable
 *
 * @param {Namespace} namespace - Socket.io namespace for publishing changes.
 * @param {Object} values - User-supplied data detailing the elements.
 * Properties on this object that line up with {@link module:shared.Element}
 * members will be stored. Any other properties will be ignored.
 */
class ServerGroup extends Identifiable(Hittable(Item)) {
  constructor(namespace, values = {}) {
    super(values);

    /**
     * Socket.io namespace for publishing updates.
     *
     * @type {Namespace}
     */
    this.namespace = namespace;

    // Notify subscribers immediately.
    if (!this.items) throw 'Items must be passed to ServerGroup.';

    // calculate based on elements positions;
    this.setMeasures();

    this.setParentForItems();

    this.setupInteractions();
  }

  setupInteractions() {
    const doGesture = this.shouldDoGesture(this.allowDrag);    
    if (doGesture) {
      this.items.forEach(item => {
        // trying to drag any of the items will drag the whole group
        item.allowDrag = true;
      });
    }
  }

  /**
   * Helper function to tell if gesture should be done.
   * 
   * @param {*} handler 
   */
  shouldDoGesture(handler) {
    switch (typeof handler) {
      case 'function': 
        if (handler() === true) return true;
      case 'boolean':
        if (handler === true) return true;
        break;
      default:
        return false;
    }
  }

  /*
   * Publish a general notification about the status of the group.
   */
  emitPublication() {
    new Message(Message.UD_ITEM, this).emitWith(this.namespace);
  }

  moveTo(x, y) {
    const offsetX = x - this.x;
    const offsetY = y - this.y;
    this.x = x;
    this.y = y;
    this.items.forEach(item => item.moveBy(offsetX, offsetY));
  }

  moveBy(dx, dy) {
    this.x = this.x + dx;
    this.y = this.y + dy;
    this.items.forEach(item => item.moveBy(dx, dy));
  }

  /**
   * Update children items to have parent property.
   *
   */
  setParentForItems() {
    this.items.forEach(item => {
      item.parent = this;
      const dreport = new DataReporter({
        data: { id: item.id, parent: this.id },
      });
      new Message(Message.SET_PARENT, dreport).emitWith(this.namespace);
    });
  }

  setMeasures() {
    // calculate x, y, width and height
    // of the group
    let minX = Number.MAX_SAFE_INTEGER;
    let minY = Number.MAX_SAFE_INTEGER;
    let maxX = -Number.MAX_SAFE_INTEGER;
    let maxY = -Number.MAX_SAFE_INTEGER;
    this.items.forEach(el => {
      minX = Math.min(minX, el.x);
      minY = Math.min(minY, el.y);
      maxX = Math.max(maxX, el.x + el.width);
      maxY = Math.max(maxY, el.y + el.height);
    });
    this.x = minX;
    this.y = minY;
    // this.width = maxX - minX;
    this.height = maxY - minY;
  }
}

module.exports = ServerGroup;

