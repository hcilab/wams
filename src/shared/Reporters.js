/*
 * Reporters for the WAMS application.
 *
 * Author: Michael van der Kamp
 * Date: July / August 2018
 */

'use strict';

const ReporterFactory = require('./ReporterFactory.js');

/**
 * This Item class provides a common interface between the client and the server
 * by which the Items can interact safely.
 *
 * @class Item
 * @memberof module:shared
 * @extends module:shared.Reporter
 */
const Item = ReporterFactory({
  /**
   * X coordinate of the Item.
   *
   * @name x
   * @type {number}
   * @default 0
   * @memberof module:shared.Item
   * @instance
   */
  x: 0,

  /**
   * Y coordinate of the Item.
   *
   * @name y
   * @type {number}
   * @default 0
   * @memberof module:shared.Item
   * @instance
   */
  y: 0,

  /**
   * Rotation of the Item.
   *
   * @name rotation
   * @type {number}
   * @default 0
   * @memberof module:shared.Item
   * @instance
   */
  rotation: 0,

  /**
   * Scale of the Item.
   *
   * @name scale
   * @type {number}
   * @default 1
   * @memberof module:shared.Item
   * @instance
   */
  scale: 1,

  /**
   * Type description of the Item.
   *
   * @name type
   * @type {string}
   * @default 'item/polygonal'
   * @memberof module:shared.Item
   * @instance
   */
  type: 'item/polygonal',
});

/**
 * This WamsElement class provides a common interface between the client and the
 * server by which the elements interact safely.
 *
 * @class WamsElement
 * @memberof module:shared
 * @extends module:shared.Reporter
 */
const WamsElement = ReporterFactory({
  /**
   * X coordinate of the WamsElement.
   *
   * @name x
   * @type {number}
   * @default 0
   * @memberof module:shared.WamsElement
   * @instance
   */
  x: 0,

  /**
   * Y coordinate of the WamsElement.
   *
   * @name y
   * @type {number}
   * @default 0
   * @memberof module:shared.WamsElement
   * @instance
   */
  y: 0,

  /**
   * Width of the WamsElement.
   *
   * @name width
   * @type {number}
   * @default 400
   * @memberof module:shared.WamsElement
   * @instance
   */
  width: 400,

  /**
   * Height of the WamsElement.
   *
   * @name height
   * @type {number}
   * @default 300
   * @memberof module:shared.WamsElement
   * @instance
   */
  height: 300,

  /**
   * Rotation of the WamsElement.
   *
   * @name rotation
   * @type {number}
   * @default 0
   * @memberof module:shared.WamsElement
   * @instance
   */
  rotation: 0,

  /**
   * Scale of the WamsElement.
   *
   * @name scale
   * @type {number}
   * @default 1
   * @memberof module:shared.WamsElement
   * @instance
   */
  scale: 1,

  /**
   * Type description of the WamsElement.
   *
   * @name type
   * @type {string}
   * @default 'item/element'
   * @memberof module:shared.WamsElement
   * @instance
   */
  type: 'item/element',

  /**
   * Tag name of the WamsElement.
   *
   * @name tagname
   * @type {string}
   * @default 'div'
   * @memberof module:shared.WamsElement
   * @instance
   */
  tagname: 'div',
});

/**
 * This WamsImage class provides a common interface between the client and the
 * server by which the images can interact safely.
 *
 * @class WamsImage
 * @memberof module:shared
 * @extends module:shared.Reporter
 */
const WamsImage = ReporterFactory({
  /**
   * X coordinate of the WamsImage.
   *
   * @name x
   * @type {number}
   * @default 0
   * @memberof module:shared.WamsImage
   * @instance
   */
  x: 0,

  /**
   * Y coordinate of the WamsImage.
   *
   * @name y
   * @type {number}
   * @default 0
   * @memberof module:shared.WamsImage
   * @instance
   */
  y: 0,

  /**
   * Width of the WamsImage.
   *
   * @name width
   * @type {number}
   * @default 400
   * @memberof module:shared.WamsImage
   * @instance
   */
  width: 400,

  /**
   * Height of the WamsImage.
   *
   * @name height
   * @type {number}
   * @default 300
   * @memberof module:shared.WamsImage
   * @instance
   */
  height: 300,

  /**
   * Rotation of the WamsImage.
   *
   * @name rotation
   * @type {number}
   * @default 0
   * @memberof module:shared.WamsImage
   * @instance
   */
  rotation: 0,

  /**
   * Scale of the WamsImage.
   *
   * @name scale
   * @type {number}
   * @default 1
   * @memberof module:shared.WamsImage
   * @instance
   */
  scale: 1,

  /**
   * Type description of the WamsImage.
   *
   * @name type
   * @type {string}
   * @default 'item/image'
   * @memberof module:shared.WamsImage
   * @instance
   */
  type: 'item/image',
});

/**
 * This View class provides a common interface between the client and
 * the server by which the Views can interact safely.
 *
 * @class View
 * @memberof module:shared
 * @extends module:shared.Reporter
 */
const View = ReporterFactory({
  /**
   * X coordinate of the View.
   *
   * @name x
   * @type {number}
   * @default 0
   * @memberof module:shared.View
   * @instance
   */
  x: 0,

  /**
   * Y coordinate of the View.
   *
   * @name y
   * @type {number}
   * @default 0
   * @memberof module:shared.View
   * @instance
   */
  y: 0,

  /**
   * Width of the View.
   *
   * @name width
   * @type {number}
   * @default 1600
   * @memberof module:shared.View
   * @instance
   */
  width: 1600,

  /**
   * Height of the View.
   *
   * @name height
   * @type {number}
   * @default 900
   * @memberof module:shared.View
   * @instance
   */
  height: 900,

  /**
   * Type of object.
   *
   * @name type
   * @type {string}
   * @default 'view/background'
   * @memberof module:shared.View
   * @instance
   */
  type: 'view/background',

  /**
   * Scale of the View.
   *
   * @name scale
   * @type {number}
   * @default 1
   * @memberof module:shared.View
   * @instance
   */
  scale: 1,

  /**
   * Rotation of the View.
   *
   * @name rotation
   * @type {number}
   * @default 0
   * @memberof module:shared.View
   * @instance
   */
  rotation: 0,
});

/**
 * This class allows generic Input data reporting between client and server.
 * Honestly it's a bit of a cheaty hack around the Message / Reporter protocol,
 * but it simplifies the code and makes things easier to maintain. And honestly
 * the Message / Reporter protocol is mostly focused on protecting Views and
 * Items anyway.
 *
 * @class DataReporter
 * @memberof module:shared
 * @extends module:shared.Reporter
 */
const DataReporter = ReporterFactory({
  /**
   * Generic data pass-through.
   *
   * @name data
   * @type {Object}
   * @default null
   * @memberof module:shared.DataReporter
   * @instance
   */
  data: null,
});

/**
 * This class allows reporting of the full state of the model, for bringing
 * new clients up to speed (or potentially also for recovering a client, if
 * need be).
 *
 * @class FullStateReporter
 * @memberof module:shared
 * @extends module:shared.Reporter
 */
const FullStateReporter = ReporterFactory({
  /**
   * All currently active views.
   *
   * @name views
   * @type {View[]}
   * @default []
   * @memberof module:shared.FullStateReporter
   * @instance
   */
  views: [],

  /**
   * All current items.
   *
   * @name items
   * @type {Item[]}
   * @default []
   * @memberof module:shared.FullStateReporter
   * @instance
   */
  items: [],

  /**
   * The background colour of the workspace.
   *
   * @name color
   * @type {string}
   * @default '#dad1e3'
   * @memberof module:shared.FullStateReporter
   * @instance
   */
  color: '#dad1e3',

  /**
   * The id assigned to this view.
   *
   * @name id
   * @type {number}
   * @default null
   * @memberof module:shared.FullStateReporter
   * @instance
   */
  id: null,

  /**
   * Whether to use server-side gestures.
   *
   * @name useServerGestures
   * @type {boolean}
   * @default false
   * @memberof module:shared.FullStateReporter
   * @instance
   */
  useServerGestures: false,
});

/**
 * Enables forwarding of TouchEvents from the client to the server.
 *
 * @class TouchReporter
 * @memberof module:shared
 * @extends module:shared.Reporter
 */
const TouchReporter = ReporterFactory({
  /**
   * The type of event. (e.g. 'pointerdown', 'pointermove', etc.)
   *
   * @name type
   * @type {string}
   * @default null
   * @memberof module:shared.TouchReporter
   * @instance
   */
  type: null,

  /**
   * Array of changed touches.
   *
   * @name changedTouches
   * @type {Touch[]}
   * @default []
   * @memberof module:shared.TouchReporter
   * @instance
   */
  changedTouches: [],

  /**
   * Whether the CTRL key was pressed at the time of the event.
   *
   * @name ctrlKey
   * @type {boolean}
   * @default false
   * @memberof module:shared.TouchReporter
   * @instance
   */
  ctrlKey: false,

  /**
   * Whether the ALT key was pressed at the time of the event.
   *
   * @name altKey
   * @type {boolean}
   * @default false
   * @memberof module:shared.TouchReporter
   * @instance
   */
  altKey: false,

  /**
   * Whether the SHIFT key was pressed at the time of the event.
   *
   * @name shiftKey
   * @type {boolean}
   * @default false
   * @memberof module:shared.TouchReporter
   * @instance
   */
  shiftKey: false,

  /**
   * Whether the META key was pressed at the time of the event.
   *
   * @name metaKey
   * @type {boolean}
   * @default false
   * @memberof module:shared.TouchReporter
   * @instance
   */
  metaKey: false,
});

module.exports = {
  Item,
  View,
  DataReporter,
  FullStateReporter,
  TouchReporter,
  WamsElement,
  WamsImage,
};

