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

const WamsShared = require('../shared.js');
const ListenerFactory = require('./ListenerFactory.js');
const ServerItem = require('./ServerItem.js');
const ServerView = require('./ServerView.js');

const DEFAULTS = Object.freeze({
  bounds: { x: 10000, y: 10000 },
  color: '#aaaaaa',
});
const MIN_BOUND = 100;
const STAMPER = new WamsShared.IdStamper();

/*
 * Prevents NaN from falling through.
 */
function safeNumber(x) {
  return Number(x) || 0;
}

/*
 * Makes sure that the received bounds are valid.
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
  constructor(settings) {
    this.settings = WamsShared.getInitialValues(DEFAULTS, settings);
    this.settings.bounds = resolveBounds(this.settings.bounds);
    STAMPER.stampNewId(this);

    // Things to track.
    // this.subWS = [];
    this.views = [];
    this.items = [];

    // Attach NOPs for the event listeners, so they are callable.
    this.handlers = {};
    ListenerFactory.TYPES.forEach( ev => {
      this.handlers[ev] = WamsShared.NOP;
    });
  }

  get width()  { return this.settings.bounds.x; }
  get height() { return this.settings.bounds.y; }
  set width(width)   { this.settings.bounds.x = width;  }
  set height(height) { this.settings.bounds.y = height; }

  // addSubWS(subWS) {
  //   this.subWS.push(subWS);
  //   //TODO: add check to make sure subWS is in bounds of the main workspace
  //   //TODO: probably send a workspace update message
  // }

  findItemByCoordinates(x,y) {
    return WamsShared.findLast(this.items, o => o.containsPoint(x,y));
  }

  handle(message, ...args) {
    return this.handlers[message](...args);
  }

  on(event, listener) {
    const type = event.toLowerCase();
    this.handlers[type] = ListenerFactory.build(type, listener, this);
  }

  removeView(view) {
    return WamsShared.removeById( this.views, view, ServerView );
  }

  removeItem(item) {
    return WamsShared.removeById( this.items, item, ServerItem );
  }

  reportViews() {
    return this.views.map( v => v.report() );
  }

  reportItems() {
    return this.items.map( o => o.report() );
  }

  spawnView(values = {}) {
    values.bounds = this.settings.bounds;
    const v = new ServerView(values);
    this.views.push(v);
    return v;
  }

  spawnItem(values = {}) {
    const o = new ServerItem(values);
    this.items.push(o);
    return o;
  }
}

module.exports = WorkSpace;

