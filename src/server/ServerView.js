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

const { mergeMatches, IdStamper, Message, View } = require('../shared.js');
const { Interactable, Locker } = require('../mixins.js');

const STAMPER = new IdStamper();

/**
 * The ServerView provides operations for the server to locate, move, and
 * rescale views.
 *
 * @memberof module:server
 * @extends module:shared.View
 * @mixes module:mixins.Interactable
 * @mixes module:mixins.Locker
 */
class ServerView extends Locker(Interactable(View)) {
  /**
   * @param {Namespace} socket - Socket.io socket for publishing changes.
   * @param {Object} [ values ] - Object with user supplied values describing
   * the view.
   */
  constructor(socket, values = {}) {
    super(mergeMatches(ServerView.DEFAULTS, values));

    /**
     * Socket.io socket for publishing changes.
     *
     * @type {Socket}
     */
    this.socket = socket;

    /**
     * Id to make the views uniquely identifiable.
     *
     * @name id
     * @type {number}
     * @constant
     * @instance
     * @memberof module:server.ServerView
     */
    STAMPER.stampNewId(this);
  }

  /**
   * Get the position of the bottom left corner of this view.
   *
   * @type {module:shared.Point2D}
   */
  get bottomLeft() { return this.transformPoint(0, this.height); }

  /**
   * Get the position of the bottom right corner of this view.
   *
   * @type {module:shared.Point2D}
   */
  get bottomRight() { return this.transformPoint(this.width, this.height); }

  /**
   * Get the position of the top left corner of this view.
   *
   * @type {module:shared.Point2D}
   */
  get topLeft() { return this.transformPoint(0, 0); }

  /**
   * Get the position of the top right corner of this view.
   *
   * @type {module:shared.Point2D}
   */
  get topRight() { return this.transformPoint(this.width, 0); }

  /*
   * Publish the view, bringing subscribers up to date.
   *
   * @override
   */
  publish() {
    new Message(Message.UD_SHADOW, this).emitWith(this.socket.broadcast);
    new Message(Message.UD_VIEW,   this).emitWith(this.socket);
  }

  /*
   * Scale the item by the given amount.
   *
   * @override
   */
  scaleBy(ds = 1, mx, my) {
    super.scaleBy(ds, mx, my, 'divideBy');
  }
}

/**
 * The default values for a ServerView.
 *
 * @type {Object}
 */
ServerView.DEFAULTS = Object.freeze({
  x:        0,
  y:        0,
  width:    1600,
  height:   900,
  type:     'view/background',
  scale:    1,
  rotation: 0,
});

module.exports = ServerView;

