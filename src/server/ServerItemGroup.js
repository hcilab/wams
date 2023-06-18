'use strict';

const { EventEmitter } = require('node:events');
const { Message, Item } = require('../shared.js');
const { Hittable, Identifiable } = require('../mixins.js');

/**
 * HACK to get around jsdoc bug that causes mixed methods and properties to be
 * duplicated.
 *
 * @class __ServerItemGroup
 * @private
 * @mixes module:mixins.Hittable
 * @mixes module:mixins.Identifiable
 */

/**
 * The ServerItemGroup provides operations for the server to locate and move
 * several different elements around.
 *
 * @memberof module:server
 * @extends module:shared.WamsElement
 * @extends __ServerItemGroup
 *
 * @param {Namespace} namespace - Socket.io namespace for publishing changes.
 * @param {Object} values - User-supplied data detailing the elements.
 * Properties on this object that line up with {@link module:shared.Element}
 * members will be stored. Any other properties will be ignored.
 */
class ServerItemGroup extends Identifiable(Hittable(Item)) {
  constructor(namespace, values = {}) {
    super(values);

    /**
     * Socket.io namespace for publishing updates.
     *
     * @type {Namespace}
     */
    this.namespace = namespace;

    // Notify subscribers immediately.
    if (!this.items) throw Error('Items must be passed to ServerItemGroup.');

    // calculate based on elements positions;
    this.setMeasures();

    this.setParentForItems();
  }

  on(eventName, listener) {
    this.items.forEach((item) => {
      item.on(eventName, (event) => {
        event.target = this;
        return listener(event);
      });
    });
  }

  /*
   * Publish a general notification about the status of the group.
   */
  _emitPublication() {
    this.namespace.emit(Message.UD_ITEM, this);
  }

  moveTo(x, y) {
    const offsetX = x - this.x;
    const offsetY = y - this.y;
    this.x = x;
    this.y = y;
    this.items.forEach((item) => item.moveBy(offsetX, offsetY));
  }

  moveBy(dx, dy) {
    this.x = this.x + dx;
    this.y = this.y + dy;
    this.items.forEach((item) => item.moveBy(dx, dy));
  }

  /**
   * Update children items to have parent property.
   *
   */
  setParentForItems() {
    this.items.forEach((item) => {
      item.parent = this;
      this.namespace.emit(Message.SET_PARENT, { id: item.id, parent: this.id });
    });
  }

  setMeasures() {
    // calculate x, y, width and height
    // of the group
    let minX = Number.MAX_SAFE_INTEGER;
    let minY = Number.MAX_SAFE_INTEGER;
    let maxX = -Number.MAX_SAFE_INTEGER;
    let maxY = -Number.MAX_SAFE_INTEGER;
    this.items.forEach((el) => {
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

Object.assign(ServerItemGroup.prototype, EventEmitter.prototype);

module.exports = ServerItemGroup;
