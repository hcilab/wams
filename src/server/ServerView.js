'use strict';

const { EventEmitter } = require('node:events');
const { IdStamper, Message, View } = require('../shared.js');
const { Interactable, Locker } = require('../mixins.js');

const STAMPER = new IdStamper();

/**
 * HACK to get around jsdoc bug that causes mixed methods and properties to be
 * duplicated.
 *
 * @class __ServerView
 * @private
 * @mixes module:mixins.Interactable
 * @mixes module:mixins.Locker
 */

/**
 * The ServerView provides operations for the server to locate, move, and
 * rescale views.
 *
 * @memberof module:server
 * @extends module:shared.View
 * @extends __ServerView
 *
 * @param {Namespace} socket - Socket.io socket for publishing changes.
 * @param {Object} [ values ] - Object with user supplied values describing the
 * view.
 */
class ServerView extends Locker(Interactable(View)) {
  constructor(socket, values = {}) {
    super(values);

    /**
     * Socket.io socket for publishing changes.
     *
     * @type {Socket}
     */
    this.socket = socket;

    /**
     * A place for user to store view state.
     */
    this.state = {};

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
  get bottomLeft() {
    return this.transformPoint(0, this.height);
  }

  /**
   * Get the position of the bottom right corner of this view.
   *
   * @type {module:shared.Point2D}
   */
  get bottomRight() {
    return this.transformPoint(this.width, this.height);
  }

  /**
   * Get the position of the top left corner of this view.
   *
   * @type {module:shared.Point2D}
   */
  get topLeft() {
    return this.transformPoint(0, 0);
  }

  /**
   * Get the position of the top right corner of this view.
   *
   * @type {module:shared.Point2D}
   */
  get topRight() {
    return this.transformPoint(this.width, 0);
  }

  /*
   * Publish the view, bringing subscribers up to date.
   *
   * @override
   */
  _emitPublication() {
    this.socket.broadcast.emit(Message.UD_SHADOW, this);
    this.socket.emit(Message.UD_VIEW, this);
  }

  /**
   * Send Message to this view to dispatch a user-defined event.
   *
   * @param {string} event name of the user-defined event.
   * @param {object} payload argument to pass to the event handler.
   */
  dispatch(action, payload) {
    console.debug(`dispatch: ${action} to View ${this.id}`);
    this.socket.emit(Message.DISPATCH, { action, payload });
  }

  /*
   * Scale the view by the given amount.
   *
   * @override
   */
  scaleBy(ds = 1, mx, my) {
    super.scaleBy(ds, mx, my, 'divideBy');
  }
}

Object.assign(ServerView.prototype, EventEmitter.prototype);

module.exports = ServerView;
