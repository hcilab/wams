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
   * Removes the given item.
   *
   * @param {module:shared.Item} item - The Item to remove.
   *
   * @return {boolean} true if removal was successful, false otherwise.
   */
  removeItem(item) {
    const obj = this.items.get(item.id);
    if (Object.prototype.hasOwnProperty.call(obj, 'tagname')) {
      this.rootElement.removeChild(obj.element);
    }

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
   * Set up the internal copy of the model according to the data provided by the
   * server.
   */
  setup(data) {
    REQUIRED_DATA.forEach((d) => {
      if (!Object.prototype.hasOwnProperty.call(data, d)) throw Error(`setup requires: ${d}`);
    });
    data.views.forEach((v) => v.id !== this.view.id && this.addShadow(v));
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
   * Call the given method with the given property of 'data' on the item with id
   * equal to data.id.
   *
   * @param {string} fnName
   * @param {string} property
   * @param {object} data
   */
  setItemValue(fnName, property, data) {
    if (this.items.has(data.id)) {
      this.items.get(data.id)[fnName](data[property]);
    }
  }

  /**
   * Set the attributes for the appropriate item.
   *
   * @param {object} data
   */
  setAttributes(data) {
    this.setItemValue('setAttributes', 'attributes', data);
  }

  setParent(data) {
    this.setItemValue('setParent', 'parent', data);
  }

  /**
   * Set the image for the appropriate item.
   *
   * @param {object} data
   */
  setImage(data) {
    this.setItemValue('setImage', 'src', data);
  }

  /**
   * Set the canvas rendering sequence for the appropriate item.
   *
   * @param {object} data
   */
  setRender(data) {
    this.setItemValue('setRender', 'sequence', data);
  }

  /**
   * Intended for use as an internal helper function, so that this functionality
   * does not need to be defined twice for both of the items and shadows arrays.
   *
   * @param {string} container - Name of the ClientView property defining the
   * array which contains the object to update.
   * @param {( module:shared.Item | module:shared.View )} data - Data with which
   * an object in the container will be updated.  Note that the object is
   * located using an 'id' field on this data object.
   */
  update(container, data) {
    if (this[container].has(data.id)) {
      const itemOrView = this[container].get(data.id);
      Object.assign(itemOrView, data);
      if (container === 'items') {
        if (!itemOrView.lockZ) {
          this.bringItemToTop(data.id);
        }
      }
    } else {
      console.warn(`Unable to find in ${container}: id: `, data.id);
    }
  }

  /**
   * Update an item.
   *
   * @param {module:shared.Item} data - data from the server, has an 'id' field
   * with which the item will be located.
   */
  updateItem(data) {
    this.update('items', data);
  }

  /**
   * Update a 'shadow' view.
   *
   * @param {module:shared.View} data - data from the server, has an 'id' field
   * with which the view will be located.
   */
  updateShadow(data) {
    this.update('shadows', data);
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
