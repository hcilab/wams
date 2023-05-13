'use strict';

const ClientElement = require('./ClientElement.js');
const ClientImage = require('./ClientImage.js');
const ClientItem = require('./ClientItem.js');
const ShadowView = require('./ShadowView.js');
const { removeById } = require('../shared.js');

const REQUIRED_DATA = Object.freeze(['viewId', 'items', 'views']);

/**
 * The ClientModel is a client-side copy of those aspects of the model that are
 * necessary for rendering the view for the user.
 *
 * @memberof module:client
 */
class ClientModel {
  constructor(root) {
    /**
     * Root element where WAMS canvas and HTML elements are located.
     *
     * @type {Element}
     */
    // eslint-disable-next-line
    this.rootElement = root;

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
     * The view data for this user.
     *
     * @type {module:client.ClientView}
     */
    this.view = null;
  }

  /**
   * Generate and store an item of the given type.
   *
   * @param {function} ClassFn
   * @param {object} values
   */
  addObject(ClassFn, values) {
    const object = new ClassFn(values);
    this.itemOrder.push(object);
    this.items.set(object.id, object);
  }

  /**
   * Generate and store an Element with the given values.
   *
   * @param {module:shared.WamsElement} values - State of the new Element
   */
  addElement(values) {
    this.addObject(ClientElement, values);
  }

  /**
   * Generate and store an Image with the given values.
   *
   * @param {module:shared.WamsImage} values - State of the new image.
   */
  addImage(values) {
    this.addObject(ClientImage, values);
  }

  /**
   * Generate and store an Item with the given values.
   *
   * @param {module:shared.Item} values - State of the new Item.
   */
  addItem(values) {
    this.addObject(ClientItem, values);
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
   * Retrieve an item by ID. Throw an Error if the item isn't found.
   *
   * @param {number} id - ID of the item to retrieve.
   */
  getItem(id) {
    const item = this.items.get(id);
    if (item === undefined) {
      throw Error(`Unable to find item with id: ${id}`);
    }
    return item;
  }

  /**
   * Retrieve a Shadow by ID. Throw an Error if the shadow isn't found.
   *
   * @param {number} id - ID of the shadow to retrieve.
   */
  getShadow(id) {
    const shadow = this.shadows.get(data.id);
    if (shadow === undefined) {
      throw Error(`Unable to find shadow with id: ${id}`);
    }
    return shadow;
  }

  /**
   * Removes the given item.
   *
   * @param {module:shared.Item} item - The Item to remove.
   *
   * @return {boolean} true if removal was successful, false otherwise.
   */
  removeItem(data) {
    const item = this.getItem(data.id);
    if (Object.prototype.hasOwnProperty.call(obj, 'tagname')) {
      this.rootElement.removeChild(obj.element);
    }
    this.items.delete(data.id);
    return removeById(this.itemOrder, data);
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
   * Set up the internal copy of the model according to the data provided by the
   * server.
   */
  initialize(data) {
    REQUIRED_DATA.forEach((d) => {
      if (!Object.prototype.hasOwnProperty.call(data, d)) throw Error(`initialize requires: ${d}`);
    });
    data.views.forEach((v) => {
      if (v.id !== this.view.id) {
        this.addShadow(v);
      }
    });
    data.items.reverse().forEach((o) => {
      if (Object.prototype.hasOwnProperty.call(o, 'src')) {
        this.addImage(o);
      } else if (Object.prototype.hasOwnProperty.call(o, 'tagname')) {
        this.addElement(o);
      } else {
        this.addItem(o);
      }
    });
    this.view.config.shadows = data.shadows;
    this.view.config.status = data.settings.status;
    this.view.config.backgroundImage = data.settings.backgroundImage;
  }

  /**
   * Bring item to top, so that it's above others.
   *
   */
  bringItemToTop(id) {
    const index = this.itemOrder.findIndex((el) => el.id === id);
    this.itemOrder.push(...this.itemOrder.splice(index, 1));
  }

  /**
   * Set the attributes for the appropriate item.
   *
   * @param {object} data
   */
  setAttributes(data) {
    const item = this.getItem(data.id);
    item.setAttributes(data.attributes);
  }

  setParent(data) {
    const item = this.getItem(data.id);
    item.setParent(data.parent);
  }

  /**
   * Set the image for the appropriate item.
   *
   * @param {object} data
   */
  setImage(data) {
    const item = this.getItem(data.id);
    item.setImage(data.src);
  }

  /**
   * Set the canvas rendering sequence for the appropriate item.
   *
   * @param {object} data
   */
  setRender(data) {
    const item = this.getItem(data.id);
    item.setRender(data.sequence);
  }

  /**
   * Update an item.
   *
   * @param {module:shared.Item} data - data from the server, has an 'id' field
   * with which the item will be located.
   */
  updateItem(data) {
    const item = this.getItem(data.id);
    Object.assign(item, data);
    if (!item.lockZ) {
      this.bringItemToTop(data.id);
    }
  }

  /**
   * Update a 'shadow' view.
   *
   * @param {module:shared.View} data - data from the server, has an 'id' field
   * with which the view will be located.
   */
  updateShadow(data) {
    const shadow = this.getShadow(data.id);
    Object.assign(shadow, data);
  }

  /**
   * Update the view.
   *
   * @param {module:shared.View} data - data from the server, specficially
   * pertaining to this client's view.
   */
  updateView(data) {
    Object.assign(this.view, data);
  }

  /**
   * Dispatch custom DOM event to trigger user defined action
   *
   * @param {object} event - event data, contains `action` and `payload`
   */
  dispatch(event) {
    document.dispatchEvent(new CustomEvent(event.action, { detail: event.payload }));
  }
}

module.exports = ClientModel;
