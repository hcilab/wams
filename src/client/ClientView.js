/*
 * WAMS code to be executed in the client browser.
 *
 * Author: Michael van der Kamp
 *  |-> Date: July/August 2018
 *
 * Original author: Jesse Rolheiser
 * Other revisions and supervision: Scott Bateman
 */

'use strict';

const ClientImage = require('./ClientImage.js');
const ClientItem = require('./ClientItem.js');
const ShadowView = require('./ShadowView.js');
const {
  constants,
  removeById,
  IdStamper,
  View,
} = require('../shared.js');

const STATUS_KEYS = Object.freeze([
  'x',
  'y',
  'width',
  'height',
  'rotation',
  'scale',
]);

const REQUIRED_DATA = Object.freeze([
  'id',
  'items',
  'views',
]);

const STAMPER = new IdStamper();

const symbols = Object.freeze({
  align:        Symbol('align'),
  drawItems:    Symbol('drawItems'),
  drawShadows:  Symbol('drawShadows'),
  drawStatus:   Symbol('drawStatus'),
  wipe:         Symbol('wipe'),
});

/**
 * The ClientView is responsible for rendering the view. To do this, it keeps
 * track of its own position, scale, and orientation, as well as those values
 * for all items and all other views (which will be represented with outlines).
 *
 * @extends module:shared.View
 * @memberof module:client
 */
class ClientView extends View {
  /**
   * @param {module:shared.View} values Data for initializing this view. Likely
   * does not come from the server, as communication lines probably won't be
   * open yet at the time that this class is instantiated.
   */
  constructor(values = {}) {
    super({ ...ClientView.DEFAULTS, ...values });

    /**
     * The CanvasRenderingContext2D is required for drawing (rendering) to take
     * place.
     *
     * @type {CanvasRenderingContext2D}
     */
    this.context = values.context;

    /**
     * All the items in the model, which may all need rendering at some point.
     * Kept up to date via the ClientController.
     *
     * @type {Map.<module:client.ClientItem>}
     */
    this.items = new Map();

    /**
     * An ordered list of the items, so that the render order can accurately
     * match the order on the server, and be adjusted likewise.
     *
     * @type {module:client.ClientItem[]}
     */
    this.itemOrder = [];

    /**
     * The shadows are all the other views that are currently active. They are
     * tracked in full and an outline for each is rendered.
     *
     * @type {Map.<module:client.ShadowView>}
     */
    this.shadows = new Map();

    /**
     * Id to make the views uniquely identifiable. Will be assigned when setup
     * message is received from server.
     *
     * @name id
     * @type {number}
     * @constant
     * @instance
     * @memberof module:client.ClientView
     */
    this.id = null;
  }

  /**
   * Positions the rendering context precisely, taking into account all
   * transformations, so that rendering can proceed correctly.
   */
  [symbols.align]() {
    /*
     * WARNING: It is crucially important that the instructions below occur
     * in *precisely* this order!
     */
    this.context.scale(this.scale, this.scale);
    this.context.rotate(this.rotation);
    this.context.translate(-this.x, -this.y);
  }

  /**
   * Renders all the items.
   */
  [symbols.drawItems]() {
    this.itemOrder.forEach(o => o.draw(this.context));
  }

  /**
   * Renders outlines of all the other views.
   */
  [symbols.drawShadows]() {
    this.shadows.forEach(v => v.draw(this.context));
  }

  /**
   * Renders text describing the status of the view to the upper left corner of
   * the view, to assist with debugging.
   */
  [symbols.drawStatus]() {
    const messages = STATUS_KEYS
      .map(k => `${k}: ${this[k].toFixed(2)}`)
      .concat([`# of Shadows: ${this.shadows.size}`]);
    let ty = 40;
    const tx = 20;

    this.context.save();
    this.context.setTransform(1, 0, 0, 1, 0, 0);
    this.context.font = '18px Georgia';
    messages.forEach(m => {
      this.context.fillText(m, tx, ty);
      ty += 20;
    });
    this.context.restore();
  }

  /**
   * Clears all previous renders, to ensure a clean slate for the upcoming
   * render.
   */
  [symbols.wipe]() {
    this.context.clearRect(0, 0, window.innerWidth, window.innerHeight);
  }

  /**
   * Generate and store an Item with the given values.
   *
   * @param {module:shared.Item} values - State of the new Item.
   */
  addItem(values) {
    let item = null;
    if ('src' in values) {
      item = new ClientImage(values);
    } else {
      item = new ClientItem(values);
    }
    this.itemOrder.push(item);
    this.items.set(item.id, item);
  }

  /**
   * Generate and store a 'shadow view' to track another active view.
   *
   * @param {module:shared.View} values - State of the new View.
   */
  addShadow(values) {
    const shadow = new ShadowView(values);
    this.shadows.set(shadow.id, shadow);
  }

  /**
   * Fully render the current state of the system.
   */
  draw() {
    this.context.save();
    this[symbols.wipe]();
    this[symbols.align]();
    this[symbols.drawItems]();
    this[symbols.drawShadows]();
    this[symbols.drawStatus]();
    this.context.restore();
  }

  /**
   * Removes the given item.
   *
   * @param {module:shared.Item} item - The Item to remove.
   *
   * @return {boolean} true if removal was successful, false otherwise.
   */
  removeItem(item) {
    this.items.delete(item.id);
    return removeById(this.itemOrder, item);
  }

  /**
   * Removes the given 'shadow' view.
   *
   * @param {module:shared.View} shadow - The 'shadow' view to remove.
   *
   * @return {boolean} true if removal was successful, false otherwise.
   */
  removeShadow(shadow) {
    return this.shadows.delete(shadow.id);
  }

  /**
   * Fill all available space in the window.
   */
  resizeToFillWindow() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
  }

  /**
   * Set up the internal copy of the model according to the data provided by the
   * server.
   *
   * @param {module:shared.FullStateReporter} data - The data from the server
   *       detailing the current state of the model.  See REQUIRED_DATA. If any
   *       is missing, something has gone terribly wrong, and an exception will
   *       be thrown.
   */
  setup(data) {
    REQUIRED_DATA.forEach(d => {
      if (!data.hasOwnProperty(d)) throw `setup requires: ${d}`;
    });
    STAMPER.cloneId(this, data.id);
    data.views.forEach(v => v.id !== this.id && this.addShadow(v));
    data.items.forEach(o => this.addItem(o));
  }

  /**
   * Intended for use as an internal helper function, so that this functionality
   * does not need to be defined twice for both of the items and shadows arrays.
   *
   * @param {string} container - Name of the ClientView property defining the
   *    array which contains the object to update.
   * @param {( module:shared.Item | module:shared.View )} data - Data with which
   * an object in the container will be updated.  Note that the object is
   * located using an 'id' field on this data object.
   */
  update(container, data) {
    if (this[container].has(data.id)) {
      this[container].get(data.id).assign(data);
    } else {
      console.warn(`Unable to find in ${container}: id: `, data.id);
    }
  }

  /**
   * Update an item.
   *
   * @param {module:shared.Item} data - data from the server, has an 'id' field
   *       with which the item will be located.
   */
  updateItem(data) {
    this.update('items', data);
  }

  /**
   * Update a 'shadow' view.
   *
   * @param {module:shared.View} data - data from the server, has an 'id' field
   *       with which the view will be located.
   */
  updateShadow(data) {
    this.update('shadows', data);
  }
}

/**
 * The default values for a ClientView.
 *
 * @type {object}
 */
ClientView.DEFAULTS = Object.freeze({
  x:        0,
  y:        0,
  rotation: constants.ROTATE_0,
  scale:    1,
  type:     'view/background',
});

module.exports = ClientView;

