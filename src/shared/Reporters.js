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
   * Image source path of the Item.
   *
   * @name imgsrc
   * @type {string}
   * @memberof module:shared.Item
   * @instance
   */
  'imgsrc',

  /**
   * Canvas blueprint for the item.
   *
   * @name blueprint
   * @type {CanvasBlueprint}
   * @memberof module:shared.Item
   * @instance
   */
  'blueprint',
]);

/**
 * This Image class provides a common interface between the client and the
 * server by which the Items can interact safely.
 *
 * @class Image
 * @memberof module:shared
 * @extends module:shared.Reporter
 */
const Image = ReporterFactory([
  /**
   * X coordinate of the Image.
   *
   * @name x
   * @type {number}
   * @memberof module:shared.Image
   * @instance
   */
  'x',

  /**
   * Y coordinate of the Image.
   *
   * @name y
   * @type {number}
   * @memberof module:shared.Image
   * @instance
   */
  'y',

  /**
   * Width of the Image.
   *
   * @name width
   * @type {number}
   * @memberof module:shared.Image
   * @instance
   */
  'width',

  /**
   * Height of the Image.
   *
   * @name height
   * @type {number}
   * @memberof module:shared.Image
   * @instance
   */
  'height',

  /**
   * Rotation of the Image.
   *
   * @name rotation
   * @type {number}
   * @memberof module:shared.Image
   * @instance
   */
  'rotation',

  /**
   * Scale of the Image.
   *
   * @name scale
   * @type {number}
   * @memberof module:shared.Image
   * @instance
   */
  'scale',

  /**
   * Type description of the Image.
   *
   * @name type
   * @type {string}
   * @memberof module:shared.Image
   * @instance
   */
  'type',

  /**
   * Image source path of the Image.
   *
   * @name src
   * @type {string}
   * @memberof module:shared.Image
   * @instance
   */
  'src',
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
 * Enables forwarding of PointerEvents from the client to the server.
 *
 * @class PointerReporter
 * @memberof module:shared
 * @extends module:shared.Reporter
 */
const PointerReporter = ReporterFactory([
  /**
   * The type of event. (e.g. 'pointerdown', 'pointermove', etc.)
   *
   * @name type
   * @type {string}
   * @memberof module:shared.PointerReporter
   * @instance
   */
  'type',

  /**
   * The pointer identifier.
   *
   * @name pointerId
   * @type {number}
   * @memberof module:shared.PointerReporter
   * @instance
   */
  'pointerId',

  /**
   * The clientX coordinate of the event.
   *
   * @name clientX
   * @type {number}
   * @memberof module:shared.PointerReporter
   * @instance
   */
  'clientX',

  /**
   * The clientY coordinate of the event.
   *
   * @name clientY
   * @type {number}
   * @memberof module:shared.PointerReporter
   * @instance
   */
  'clientY',

  /**
   * Whether the CTRL key was pressed at the time of the event.
   *
   * @name ctrlKey
   * @type {boolean}
   * @memberof module:shared.PointerReporter
   * @instance
   */
  'ctrlKey',

  /**
   * Whether the ALT key was pressed at the time of the event.
   *
   * @name altKey
   * @type {boolean}
   * @memberof module:shared.PointerReporter
   * @instance
   */
  'altKey',

  /**
   * Whether the SHIFT key was pressed at the time of the event.
   *
   * @name shiftKey
   * @type {boolean}
   * @memberof module:shared.PointerReporter
   * @instance
   */
  'shiftKey',

  /**
   * Whether the META key was pressed at the time of the event.
   *
   * @name metaKey
   * @type {boolean}
   * @memberof module:shared.PointerReporter
   * @instance
   */
  'metaKey',
]);

module.exports = {
  Item,
  Image,
  View,
  DataReporter,
  FullStateReporter,
  PointerReporter,
};

