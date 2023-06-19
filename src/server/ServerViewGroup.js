'use strict';

const { EventEmitter } = require('node:events');
const GestureController = require('./GestureController.js');
const ServerView = require('./ServerView.js');
const { IdStamper, removeById, View } = require('../shared.js');
const { Lockable, Transformable2D, Locker } = require('../mixins.js');

const SERVER_VIEW_GROUP_IDS = new IdStamper();

/**
 * HACK to get around jsdoc bug that causes mixed methods and properties to be
 * duplicated.
 *
 * @class __ServerViewGroup
 * @private
 * @mixes module:mixins.Locker
 * @mixes module:mixins.Lockable
 * @mixes module:mixins.Transformable2D
 */

/**
 * The ServerViewGroup groups a number of ServerViews together into a single
 * View, so that they can move together as one block. It is also responsible for
 * interacting with the gesture handler.
 *
 * Each view always belongs to exactly one view group. The group is responsible
 * for processing gestures for that view. In the case of multi-device gestures,
 * the inputs to those gestures can come from many views, but are combined
 * together into a single gesture response.
 *
 * @memberof module:server
 * @extends module:server.View
 * @extends __ServerViewGroup
 *
 * @param {module:server.MessageHandler} messageHandler - For responding to
 * messages from clients.
 */
class ServerViewGroup extends Locker(Lockable(Transformable2D(View))) {
  constructor(messageHandler) {
    super();

    /**
     * Controls server-side gestures.
     *
     * @type {module:server.GestureController}
     */
    this.gestureController = new GestureController(messageHandler, this);

    /**
     * The views belonging to this group.
     *
     * @type {module:server.ServerView[]}
     */
    this.views = [];

    /**
     * Id to make the view groups uniquely identifiable.
     *
     * @name id
     * @type {number}
     * @constant
     * @instance
     * @memberof module:server.ServerView
     */
    SERVER_VIEW_GROUP_IDS.stampNewId(this);
  }

  /**
   * Add a view to this group.
   *
   * @param {module:server.ServerView} view - View to add.
   */
  add(view) {
    if (view.group) {
      view.group.remove(view);
    }
    this.views.push(view);
    view.group = this;
  }

  /**
   * Remove a view from this group.
   *
   * @param {module:server.ServerView} view - View to remove.
   */
  remove(view) {
    this.clearInputsFromView(view.id);
    view.group = null;
    removeById(this.views, view);
  }

  /**
   * Clear the inputs associated with the given view from the gesture
   * controller.
   *
   * @param {number} id - Id of the view whose inputs should be cleared.
   */
  clearInputsFromView(id) {
    this.gestureController.clearOutView(id);
  }

  /*
   * Move all the views by the given amounts.
   *
   * @override
   *
   * @param {number} [ dx=0 ] - Movement along the x axis.
   * @param {number} [ dy=0 ] - Movement along the y ayis.
   */
  moveBy(dx = 0, dy = 0) {
    super.moveBy(dx, dy);
    this.views.forEach((v) => v.moveBy(dx, dy));
  }

  /*
   * Rotate all the views by the given amount, in radians.
   *
   * @override
   *
   * @param {number} [ radians=0 ] - The amount of rotation to apply to the
   * view, in radians.
   * @param {number} [ px=this.x ] - The x coordinate of the point around which
   * to rotate.
   * @param {number} [ py=this.y ] - The y coordinate of the point around which
   * to rotate.
   */
  rotateBy(radians = 0, px = this.x, py = this.y) {
    super.rotateBy(radians, px, py);
    this.views.forEach((v) => v.rotateBy(radians, px, py));
  }

  /*
   * Adjust the scale of all the views by the given amount.
   *
   * @override
   *
   * @param {number} [ ds=1 ] - Change in desired scale.
   * @param {number} [ mx=this.x ] - The x coordinate of the point around which
   * to scale.
   * @param {number} [ my=this.y ] - The y coordinate of the point around which
   * to scale.
   */
  scaleBy(ds = 1, mx = this.x, my = this.y) {
    super.scaleBy(ds, mx, my, 'divideBy');
    this.views.forEach((v) => v.scaleBy(ds, mx, my));
  }

  /*
   * Clear the locked item. Shortcuts the releaseLockedItem() approach and just
   * sets the locked item to null. Use with caution!
   *
   * @override
   * @private
   */
  clearLockedItem() {
    super.clearLockedItem();
    this.views.forEach((v) => v.clearLockedItem());
  }

  /*
   * Set the locked item. Use with caution!
   *
   * @override
   * @private
   *
   * @param {module:mixins.Lockable} item - The item to lock down.
   */
  setLockedItem(item) {
    super.setLockedItem(item);
    this.views.forEach((v) => v.setLockedItem(item));
  }

  /*
   * Lock this view group.
   *
   * @override
   *
   * @param {module:mixins.Locker} locker - The holder of the lock.
   */
  lock(locker) {
    super.lock(locker);
    this.views.forEach((v) => v.lock(locker));
  }

  /*
   * Unlock this view group.
   *
   * @override
   */
  unlock() {
    super.unlock();
    this.views.forEach((v) => v.unlock());
  }
}

Object.assign(ServerViewGroup.prototype, EventEmitter.prototype);

/*
 * Emit an event on this view group and all its views.
 *
 * @private
 * @override
 *
 * @param {string} event - The event to emit.
 * @param {...*} args - The arguments to pass to the event.
 */
ServerViewGroup.prototype.emit = function (event, ...args) {
  EventEmitter.prototype.emit.apply(this, arguments);
  this.views.forEach((v) => v.emit(event, ...args));
};

module.exports = ServerViewGroup;
