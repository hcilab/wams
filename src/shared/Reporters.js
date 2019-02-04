/*
 * Reporters for the WAMS application.
 *
 * Author: Michael van der Kamp
 * Date: July / August 2018
 */

'use strict';

const ReporterFactory = require('./ReporterFactory.js');

/**
 * This Item class provides a common interface between the client and 
 * the server by which the Items can interact safely.
 *
 * @class Item
 * @memberof module:shared
 * @extends module:shared.Reporter
 */
const Item = ReporterFactory([
  /**
   * x coordinate of the Item.
   *
   * @name x
   * @type {number}
   * @memberof module:shared.Item
   * @instance
   */
  'x',

  /**
   * y coordinate of the Item.
   *
   * @name y
   * @type {number}
   * @memberof module:shared.Item
   * @instance
   */
  'y',
  
  /**
   * The item's hitbox.
   *
   * @name hitbox
   * @type {module:server.Polygon2D}
   * @memberof module:shared.Item
   * @instance
   */
  'hitbox', // TODO: May not need to be reported

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
 * This View class provides a common interface between the client and 
 * the server by which the Views can interact safely.
 *
 * @class View
 * @memberof module:shared
 * @extends module:shared.Reporter
 */
const View = ReporterFactory([
  /**
   * x coordinate of the View.
   *
   * @name x
   * @type {number}
   * @memberof module:shared.View
   * @instance
   */
  'x',

  /**
   * y coordinate of the View.
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
]);

module.exports = {
  Item,
  View,
  DataReporter,
  FullStateReporter,
};

