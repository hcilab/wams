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
const Item = ReporterFactory([
  /**
   * X coordinate of the Item.
   *
   * @name x
   * @type {number}
   * @memberof module:shared.Item
   * @instance
   */
  'x',

  /**
   * Y coordinate of the Item.
   *
   * @name y
   * @type {number}
   * @memberof module:shared.Item
   * @instance
   */
  'y',

  /**
   * Rotation of the Item.
   *
   * @name rotation
   * @type {number}
   * @memberof module:shared.Item
   * @instance
   */
  'rotation',

  /**
   * Scale of the Item.
   *
   * @name scale
   * @type {number}
   * @memberof module:shared.Item
   * @instance
   */
  'scale',

  /**
   * Type description of the Item.
   *
   * @name type
   * @type {string}
   * @memberof module:shared.Item
   * @instance
   */
  'type',

  /**
   * Canvas sequence for the item.
   *
   * @name sequence
   * @type {CanvasSequence}
   * @memberof module:shared.Item
   * @instance
   */
  // 'sequence',
]);

/**
 * This WamsElement class provides a common interface between the client and the
 * server by which the elements interact safely.
 *
 * @class WamsElement
 * @memberof module:shared
 * @extends module:shared.Reporter
 */
const WamsElement = ReporterFactory([
  /**
   * X coordinate of the WamsElement.
   *
   * @name x
   * @type {number}
   * @memberof module:shared.WamsElement
   * @instance
   */
  'x',

  /**
   * Y coordinate of the WamsElement.
   *
   * @name y
   * @type {number}
   * @memberof module:shared.WamsElement
   * @instance
   */
  'y',

  /**
   * Width of the WamsElement.
   *
   * @name width
   * @type {number}
   * @memberof module:shared.WamsElement
   * @instance
   */
  'width',

  /**
   * Height of the WamsElement.
   *
   * @name height
   * @type {number}
   * @memberof module:shared.WamsElement
   * @instance
   */
  'height',

  /**
   * Rotation of the WamsElement.
   *
   * @name rotation
   * @type {number}
   * @memberof module:shared.WamsElement
   * @instance
   */
  'rotation',

  /**
   * Scale of the WamsElement.
   *
   * @name scale
   * @type {number}
   * @memberof module:shared.WamsElement
   * @instance
   */
  'scale',

  /**
   * Type description of the WamsElement.
   *
   * @name type
   * @type {string}
   * @memberof module:shared.WamsElement
   * @instance
   */
  'type',

  /**
   * Tag name of the WamsElement.
   *
   * @name tagname
   * @type {string}
   * @memberof module:shared.WamsElement
   * @instance
   */
  'tagname',
]);

/**
 * This WamsImage class provides a common interface between the client and the
 * server by which the images can interact safely.
 *
 * @class WamsImage
 * @memberof module:shared
 * @extends module:shared.Reporter
 */
const WamsImage = ReporterFactory([
  /**
   * X coordinate of the WamsImage.
   *
   * @name x
   * @type {number}
   * @memberof module:shared.WamsImage
   * @instance
   */
  'x',

  /**
   * Y coordinate of the WamsImage.
   *
   * @name y
   * @type {number}
   * @memberof module:shared.WamsImage
   * @instance
   */
  'y',

  /**
   * Width of the WamsImage.
   *
   * @name width
   * @type {number}
   * @memberof module:shared.WamsImage
   * @instance
   */
  'width',

  /**
   * Height of the WamsImage.
   *
   * @name height
   * @type {number}
   * @memberof module:shared.WamsImage
   * @instance
   */
  'height',

  /**
   * Rotation of the WamsImage.
   *
   * @name rotation
   * @type {number}
   * @memberof module:shared.WamsImage
   * @instance
   */
  'rotation',

  /**
   * Scale of the WamsImage.
   *
   * @name scale
   * @type {number}
   * @memberof module:shared.WamsImage
   * @instance
   */
  'scale',

  /**
   * Type description of the WamsImage.
   *
   * @name type
   * @type {string}
   * @memberof module:shared.WamsImage
   * @instance
   */
  'type',

  /**
   * Image source path of the WamsImage.
   *
   * @name src
   * @type {string}
   * @memberof module:shared.WamsImage
   * @instance
   */
  // 'src',
]);

/**
 * This View class provides a common interface between the client and
 * the server by which the Views can interact safely.
 *
 * @class View
 * @memberof module:shared
 * @extends module:shared.Reporter
 */
const View = ReporterFactory([
  /**
   * X coordinate of the View.
   *
   * @name x
   * @type {number}
   * @memberof module:shared.View
   * @instance
   */
  'x',

  /**
   * Y coordinate of the View.
   *
   * @name y
   * @type {number}
   * @memberof module:shared.View
   * @instance
   */
  'y',

  /**
   * Width of the View.
   *
   * @name width
   * @type {number}
   * @memberof module:shared.View
   * @instance
   */
  'width',

  /**
   * Height of the View.
   *
   * @name height
   * @type {number}
   * @memberof module:shared.View
   * @instance
   */
  'height',

  /**
   * Type of object.
   *
   * @name type
   * @type {string}
   * @default 'view/background'
   * @memberof module:shared.View
   * @instance
   */
  'type',

  /**
   * Scale of the View.
   *
   * @name scale
   * @type {number}
   * @memberof module:shared.View
   * @instance
   */
  'scale',

  /**
   * Rotation of the View.
   *
   * @name rotation
   * @type {number}
   * @memberof module:shared.View
   * @instance
   */
  'rotation',
]);

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
const DataReporter = ReporterFactory([
  /**
   * Generic data pass-through.
   *
   * @name data
   * @type {Object}
   * @memberof module:shared.DataReporter
   * @instance
   */
  'data',
]);

/**
 * This class allows reporting of the full state of the model, for bringing
 * new clients up to speed (or potentially also for recovering a client, if
 * need be).
 *
 * @class FullStateReporter
 * @memberof module:shared
 * @extends module:shared.Reporter
 */
const FullStateReporter = ReporterFactory([
  /**
   * All currently active views.
   *
   * @name views
   * @type {View[]}
   * @memberof module:shared.FullStateReporter
   * @instance
   */
  'views',

  /**
   * All current items.
   *
   * @name items
   * @type {Item[]}
   * @memberof module:shared.FullStateReporter
   * @instance
   */
  'items',

  /**
   * The background colour of the workspace.
   *
   * @name color
   * @type {string}
   * @memberof module:shared.FullStateReporter
   * @instance
   */
  'color',

  /**
   * The id assigned to this view.
   *
   * @name id
   * @type {number}
   * @memberof module:shared.FullStateReporter
   * @instance
   */
  'id',

  /**
   * Whether to use server-side gestures.
   *
   * @name useServerGestures
   * @type {boolean}
   * @memberof module:shared.FullStateReporter
   * @instance
   */
  'useServerGestures',
]);

/**
 * Enables forwarding of TouchEvents from the client to the server.
 *
 * @class TouchReporter
 * @memberof module:shared
 * @extends module:shared.Reporter
 */
const TouchReporter = ReporterFactory([
  /**
   * The type of event. (e.g. 'pointerdown', 'pointermove', etc.)
   *
   * @name type
   * @type {string}
   * @memberof module:shared.TouchReporter
   * @instance
   */
  'type',

  /**
   * Array of changed touches.
   *
   * @name changedTouches
   * @type {Touch[]}
   * @memberof module:shared.TouchReporter
   * @instance
   */
  'changedTouches',

  /**
   * Whether the CTRL key was pressed at the time of the event.
   *
   * @name ctrlKey
   * @type {boolean}
   * @memberof module:shared.TouchReporter
   * @instance
   */
  'ctrlKey',

  /**
   * Whether the ALT key was pressed at the time of the event.
   *
   * @name altKey
   * @type {boolean}
   * @memberof module:shared.TouchReporter
   * @instance
   */
  'altKey',

  /**
   * Whether the SHIFT key was pressed at the time of the event.
   *
   * @name shiftKey
   * @type {boolean}
   * @memberof module:shared.TouchReporter
   * @instance
   */
  'shiftKey',

  /**
   * Whether the META key was pressed at the time of the event.
   *
   * @name metaKey
   * @type {boolean}
   * @memberof module:shared.TouchReporter
   * @instance
   */
  'metaKey',
]);

module.exports = {
  Item,
  View,
  DataReporter,
  FullStateReporter,
  TouchReporter,
  WamsElement,
  WamsImage,
};

