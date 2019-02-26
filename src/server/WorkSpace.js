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
  IdStamper,
  safeRemoveById,
} = require('../shared.js');
const GestureController = require('./GestureController.js');
const ServerItem = require('./ServerItem.js');
const ServerView = require('./ServerView.js');
const ServerViewGroup = require('./ServerViewGroup.js');

const STAMPER = new IdStamper();

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
   */
  constructor(settings) {
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
     * Track all active views.
     *
     * @type {module:server.ServerView[]}
     */
    this.views = [];

    /**
     * Track all items in the workspace.
     *
     * @type {module:server.ServerItem[]}
     */
    this.items = [];

    /**
     * Processes server-side multi-device gestures.
     *
     * @type {module:server.GestureController}
     */
    this.gestureController = null;

    /**
     * A fake view for handling multi-device gestures.
     *
     * @type {module:server.ServerView}
     */
    this.gestureView = null;

    // Enable server-side gestures, if requested.
    if (settings.useServerGestures) {
      this.gestureView = new ServerViewGroup();
      this.gestureController = new GestureController(this.gestureView, {
        pan:    (data) => this.handle('drag',   this.gestureView, data),
        rotate: (data) => this.handle('rotate', this.gestureView, data),
        swipe:  (data) => this.handle('swipe',  this.gestureView, data),
        tap:    (data) => this.handle('click',  this.gestureView, data),
        zoom:   (data) => this.handle('scale',  this.gestureView, data),
        track:  (data) => this.track(data),
      });
      this.gestureView.setGestureController(this.gestureController);
    }

    // Workspaces should be uniquely identifiable.
    STAMPER.stampNewId(this);
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
    return findLast(this.items, i => i.isFreeItemAt(x, y));
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
    view.getLockOnItem(item);
  }

  /**
   * Forwards a PointerEvent to the GestureController.
   *
   * @param {PointerEvent} event - The event to forward.
   */
  pointerEvent(event) {
    this.gestureController.process(event);
  }

  /**
   * Remove the given view from the workspace.
   *
   * @param {module:server.ServerView} view - View to remove.
   *
   * @return {boolean} true if the view was located and removed, false
   * otherwise.
   */
  removeView(view) {
    if (this.gestureView) this.gestureView.removeView(view);
    return safeRemoveById(this.views, view, ServerView);
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
    return safeRemoveById(this.items, item, ServerItem);
  }

  /**
   * @return {module:shared.View[]} Reports of the currently active views.
   */
  reportViews() {
    return this.views.map(v => v.report());
  }

  /**
   * @return {module:shared.Item[]} Reports of the currently active items.
   */
  reportItems() {
    return this.items.map(o => o.report());
  }

  /**
   * Spawn a new view with the given values.
   *
   * @param {object} values - Values describing the view to spawn.
   *
   * @return {module:server.ServerView} The newly spawned view.
   */
  spawnView(values = {}) {
    const v = new ServerView(values);
    this.views.push(v);
    if (this.gestureView) this.gestureView.addView(v);
    return v;
  }

  /**
   * Spawn a new item with the given values.
   *
   * @param {object} values - Values describing the item to spawn.
   *
   * @return {module:server.ServerItem} The newly spawned item.
   */
  spawnItem(values = {}) {
    const o = new ServerItem(values);
    this.items.push(o);
    return o;
  }

  /**
   * Performs locking and unlocking based on the phase and number of active
   * points.
   *
   * @param {Object} data
   * @param {module:server.Point2D[]} data.active - Currently active contact
   * points.
   * @param {module:server.Point2D} data.centroid - Centroid of active contact
   * points.
   * @param {string} data.phase - 'start', 'move', or 'end', the gesture phase.
   */
  track({ active, centroid, phase }) {
    if (phase === 'start' && active.length === 1) {
      this.obtainLock(centroid.x, centroid.y, this.gestureView);
    } else if (phase === 'end' && active.length === 0) {
      this.gestureView.releaseLockedItem();
    }
  }
}

/**
 * The default values for a WorkSpace.
 *
 * @type {object}
 */
WorkSpace.DEFAULTS = Object.freeze({
  color:             'gray',
  useServerGestures: false,
});

module.exports = WorkSpace;

