/*
 * WAMS - An API for Multi-Surface Environments
 *
 * Author: Michael van der Kamp
 *  |-> Date: July/August 2018
 *
 * Original author: Jesse Rolheiser
 * Other revisions and supervision: Scott Bateman
 *
 * The WorkSpace keeps track of views and items, and can handle events on
 * those items and views which allow them to be interacted with.
 */

'use strict';

const { 
  findLast,
  mergeMatches, 
  IdStamper, 
  NOP,
  safeRemoveById,
} = require('../shared.js');
const CoordinateData = require('./CoordinateData.js');
const ListenerFactory = require('./ListenerFactory.js');
const ServerItem = require('./ServerItem.js');
const ServerView = require('./ServerView.js');

const DEFAULTS = Object.freeze({
  bounds: { x: 10000, y: 10000 },
  color: '#aaaaaa',
});
const MIN_BOUND = 100;
const STAMPER = new IdStamper();

/**
 * Transform x into a Number, preventing NaN from falling through. In case of
 * NaN, 0 is returned instead.
 */
function safeNumber(x) {
  return Number(x) || 0;
}

/**
 * Makes sure that the received bounds are valid, in that they are not less than
 * MIN_BOUND.
 */
function resolveBounds(bounds = {}) {
  const x = safeNumber(bounds.x);
  const y = safeNumber(bounds.y);
  if (x < MIN_BOUND || y < MIN_BOUND) {
    throw `Invalid bounds received: ${bounds}`;
  }
  return { x, y };
}

class WorkSpace {
  /**
   * settings: Options received from user.
   */
  constructor(settings) {
    /**
     * Configuration settings for the workspace.
     */
    this.settings = mergeMatches(DEFAULTS, settings);
    this.settings.bounds = resolveBounds(this.settings.bounds);

    /**
     * Track all active views.
     */
    this.views = [];

    /**
     * Track all items in the workspace.
     */
    this.items = [];

    /**
     * Store event listeners in an object, for easy access by event type.
     */
    this.handlers = {};

    // Attach NOPs for the event listeners, so they are callable.
    ListenerFactory.TYPES.forEach( ev => {
      this.handlers[ev] = NOP;
    });

    // Workspaces should be uniquely identifiable.
    STAMPER.stampNewId(this);
  }

  /**
   * Getters and setters for easy access to the boundaries of the workspace.
   */
  get width()  { return this.settings.bounds.x; }
  get height() { return this.settings.bounds.y; }
  set width(width)   { this.settings.bounds.x = width;  }
  set height(height) { this.settings.bounds.y = height; }

  /**
   * Looks for an unlocked item at the given coordinates and returns the first
   * one that it finds, or none if no unlocked items are found.
   *
   * x: x coordinate at which to look for items.
   * y: y coordinate at which to look for items.
   */
  findFreeItemByCoordinates(x, y) {
    return findLast(this.items, i => i.isFreeItemAt(x, y));
  }

  /**
   * Looks for any item at the given coordinates.
   */
  findItemByCoordinates(x, y) {
    return findLast(this.items, i => i.containsPoint(x, y));
  }

  /**
   * Gives a lock on the item at (x,y) to the view.
   */
  giveLock(x, y, view) {
    const mouse = new CoordinateData(x, y).transformFrom(view);
    if (mouse) {
      const {x, y} = mouse;
      const item = this.findFreeItemByCoordinates(x, y) || view;
      view.getLockOnItem(item);
    }
  }

  /**
   * Releases the view's lock on its item.
   */
  removeLock(view) {
    view.releaseLockedItem();
  }

  /**
   * Call the registered handler for the given message type.
   *
   * message: Type of message.
   * ...args: Arguments to pass to the handler.
   */
  handle(message, ...args) {
    return this.handlers[message](...args);
  }

  /**
   * Register a handler for the given event.
   *
   * event   : Event to respond to.
   * listener: Handler / listener to register.
   */
  on(event, listener) {
    const type = event.toLowerCase();
    this.handlers[type] = ListenerFactory.build(type, listener, this);
  }

  /**
   * Remove the given view from the workspace.
   *
   * view: View to remove.
   */
  removeView(view) {
    return safeRemoveById( this.views, view, ServerView );
  }

  /**
   * Remove the given item from the workspace.
   *
   * item: Item to remove.
   */
  removeItem(item) {
    return safeRemoveById( this.items, item, ServerItem );
  }

  /**
   * Returns an array of View reports, one for each view.
   */
  reportViews() {
    return this.views.map( v => v.report() );
  }

  /**
   * Returns an array of Item reports, one for each item.
   */
  reportItems() {
    return this.items.map( o => o.report() );
  }

  /**
   * Spawn a new view with the given values.
   */
  spawnView(values = {}) {
    values.bounds = this.settings.bounds;
    const v = new ServerView(values);
    this.views.push(v);
    return v;
  }

  /**
   * Spawn a new item with the given values.
   */
  spawnItem(values = {}) {
    const o = new ServerItem(values);
    this.items.push(o);
    return o;
  }
}

module.exports = WorkSpace;

