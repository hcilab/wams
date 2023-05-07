'use strict';

const { IdStamper, Message, View } = require('../shared.js');
const { Interactable, Locker, EventTarget } = require('../mixins.js');

const STAMPER = new IdStamper();

/**
 * The ServerView provides operations for the server to locate, move, and
 * rescale views.
 *
 * @memberof module:server
 * @extends module:shared.View
 * @mixes module:mixins.Interactable
 * @mixes module:mixins.Locker
 *
 * @param {Namespace} socket - Socket.io socket for publishing changes.
 * @param {Object} [ values ] - Object with user supplied values describing the
 * view.
 */
class ServerView extends Locker(Interactable(EventTarget(View))) {
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
    new Message(Message.UD_SHADOW, this).emitWith(this.socket.broadcast);
    new Message(Message.UD_VIEW, this).emitWith(this.socket);
  }

  /**
   * Send Message to this view to dispatch a user-defined event.
   *
   * @param {string} event name of the user-defined event.
   * @param {object} payload argument to pass to the event handler.
   */
  dispatch(action, payload) {
    console.debug(`dispatch: ${action} to View ${this.id}`);
    new Message(Message.DISPATCH, { action, payload }).emitWith(this.socket);
  }

  /*
   * Move by the given amount.
   *
   * @override
   */
  moveBy(dx = 0, dy = 0) {
    super.moveBy(dx, dy);
  }

  /*
   * Rotate the view by the given amount.
   *
   * @override
   */
  rotateBy(radians = 0, px, py) {
    super.rotateBy(radians, px, py);
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

module.exports = ServerView;
